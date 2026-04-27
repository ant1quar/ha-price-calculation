import { css, html, LitElement, type PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";

type HassLike = {
  /** Raw WS (не ломается при подмене `callService` у других карточек). */
  callWS?(msg: Record<string, unknown>): Promise<unknown>;
  connection?: {
    sendMessagePromise(msg: Record<string, unknown>): Promise<unknown>;
  };
};

type Operation = { id: string; label: string };

/** Same payload as home-assistant-js-websocket `messages.callService` — `return_response` только на верхнем уровне. */
async function callServiceWithResponse<T extends Record<string, unknown>>(
  hass: HassLike,
  domain: string,
  service: string,
  serviceData?: Record<string, unknown>
): Promise<T> {
  const message: Record<string, unknown> = {
    type: "call_service",
    domain,
    service,
    return_response: true,
  };
  if (serviceData && Object.keys(serviceData).length > 0) {
    message.service_data = serviceData;
  }
  const send =
    hass.callWS?.bind(hass) ??
    ((m: Record<string, unknown>) => {
      if (!hass.connection?.sendMessagePromise) {
        throw new Error("Нет hass.callWS и connection.sendMessagePromise");
      }
      return hass.connection.sendMessagePromise(m);
    });
  const raw = await send(message);
  return normalizeServiceResponse<T>(raw);
}

function normalizeServiceResponse<T extends Record<string, unknown>>(raw: unknown): T {
  if (!raw || typeof raw !== "object") return raw as T;
  const top = raw as Record<string, unknown>;
  if ("response" in top && top.response && typeof top.response === "object") {
    return top.response as T;
  }
  if ("result" in top && top.result && typeof top.result === "object") {
    const mid = top.result as Record<string, unknown>;
    if ("response" in mid && mid.response && typeof mid.response === "object") {
      return mid.response as T;
    }
    return mid as T;
  }
  return top as T;
}

function serviceErrorMessage(err: unknown): string {
  if (err && typeof err === "object") {
    const o = err as Record<string, unknown>;
    if (typeof o.message === "string") return o.message;
    const body = o.body;
    if (body && typeof body === "object" && typeof (body as { message?: string }).message === "string") {
      return (body as { message: string }).message;
    }
    const wsErr = o.error;
    if (wsErr && typeof wsErr === "object" && typeof (wsErr as { message?: string }).message === "string") {
      return (wsErr as { message: string }).message;
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
      const resp = await callServiceWithResponse<{ operations?: Operation[] }>(
        this.hass,
        "ha_calc",
        "get_operations"
      );
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
      const resp = await callServiceWithResponse<{ result?: number }>(this.hass, "ha_calc", "calculate", {
        a,
        b,
        operation: this._op,
      });
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
