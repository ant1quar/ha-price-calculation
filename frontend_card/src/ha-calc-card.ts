import { css, html, LitElement, type PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";

type HassLike = {
  callService(
    domain: string,
    service: string,
    data?: Record<string, unknown>,
    options?: { return_response?: boolean }
  ): Promise<unknown>;
};

type Operation = { id: string; label: string };

function serviceErrorMessage(err: unknown): string {
  if (err && typeof err === "object") {
    const o = err as Record<string, unknown>;
    if (typeof o.message === "string") return o.message;
    const body = o.body;
    if (body && typeof body === "object" && typeof (body as { message?: string }).message === "string") {
      return (body as { message: string }).message;
    }
  }
  return String(err);
}

export class HaCalcCard extends LitElement {
  @property({ attribute: false }) hass?: HassLike;

  @state() private _ops: Operation[] = [];
  @state() private _op = "add";
  @state() private _a = "";
  @state() private _b = "";
  @state() private _result: number | undefined;
  @state() private _error: string | undefined;
  @state() private _busy = false;

  static styles = css`
    :host {
      display: block;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: flex-end;
      margin-bottom: 12px;
    }
    label {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    input,
    select,
    button {
      font: inherit;
      color: var(--primary-text-color);
      background: var(--card-background-color, var(--ha-card-background));
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      padding: 8px 10px;
      min-width: 6rem;
    }
    button {
      cursor: pointer;
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      border-color: transparent;
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .out {
      margin-top: 8px;
      min-height: 1.5em;
    }
    .err {
      color: var(--error-color, #db4437);
    }
    .ok {
      color: var(--primary-text-color);
    }
  `;

  setConfig(_config: Record<string, unknown>): void {
    /* no options */
  }

  getCardSize(): number {
    return 4;
  }

  protected willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("hass") && this.hass && this._ops.length === 0) {
      void this._loadOperations();
    }
  }

  private async _loadOperations(): Promise<void> {
    if (!this.hass) return;
    try {
      const resp = (await this.hass.callService(
        "ha_calc",
        "get_operations",
        {},
        { return_response: true }
      )) as { operations?: Operation[] };
      this._ops = resp.operations ?? [];
      if (this._ops.length && !this._ops.some((o) => o.id === this._op)) {
        this._op = this._ops[0].id;
      }
    } catch (e) {
      this._error = serviceErrorMessage(e);
    }
  }

  private async _submit(ev: Event): Promise<void> {
    ev.preventDefault();
    if (!this.hass) return;
    this._busy = true;
    this._error = undefined;
    this._result = undefined;
    const a = Number(this._a);
    const b = Number(this._b);
    if (Number.isNaN(a) || Number.isNaN(b)) {
      this._busy = false;
      this._error = "Некорректное число";
      return;
    }
    try {
      const resp = (await this.hass.callService(
        "ha_calc",
        "calculate",
        { a, b, operation: this._op },
        { return_response: true }
      )) as { result?: number };
      this._result = resp.result;
    } catch (e) {
      this._error = serviceErrorMessage(e);
    } finally {
      this._busy = false;
    }
  }

  protected render(): ReturnType<typeof html> {
    return html`
      <ha-card>
        <div class="card-content">
          <form @submit=${this._submit}>
            <div class="row">
              <label>
                Операция
                <select
                  .value=${this._op}
                  @change=${(e: Event) => {
                    this._op = (e.target as HTMLSelectElement).value;
                  }}
                >
                  ${this._ops.map(
                    (o) => html`<option value=${o.id}>${o.label}</option>`
                  )}
                </select>
              </label>
              <label>
                a
                <input
                  type="number"
                  step="any"
                  .value=${this._a}
                  @input=${(e: Event) => {
                    this._a = (e.target as HTMLInputElement).value;
                  }}
                />
              </label>
              <label>
                b
                <input
                  type="number"
                  step="any"
                  .value=${this._b}
                  @input=${(e: Event) => {
                    this._b = (e.target as HTMLInputElement).value;
                  }}
                />
              </label>
              <button type="submit" ?disabled=${this._busy || !this.hass}>Считать</button>
            </div>
          </form>
          <div class="out ${this._error ? "err" : "ok"}">
            ${this._error ?? (this._result !== undefined ? String(this._result) : "")}
          </div>
        </div>
      </ha-card>
    `;
  }
}

const TAG = "ha-calc-card";
if (!customElements.get(TAG)) {
  customElements.define(TAG, HaCalcCard);
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-calc-card": HaCalcCard;
  }
}
