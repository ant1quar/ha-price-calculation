import { css, html, LitElement, type PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";

type HassLike = {
  callWS?(msg: Record<string, unknown>): Promise<unknown>;
  connection?: {
    sendMessagePromise(msg: Record<string, unknown>): Promise<unknown>;
  };
};

type Filament = { id: string; name: string; manufacturer?: string; price: number };
type Additional = { id: string; name: string; price: number };
type Settings = { material_factor: number; hourly_rate: number };

type MarginBlock = {
  landed: number;
  price_margin_60: number;
  price_margin_75: number;
  price_margin_80: number;
};

type CalcResult = {
  per_piece: MarginBlock;
  table_total: MarginBlock;
  breakdown: {
    plastic_table: number;
    additionals_table: number;
    machine_table: number;
    plastic_per_piece: number;
    additionals_per_piece: number;
    machine_per_piece: number;
  };
};

function debugEnabled(): boolean {
  try {
    const g = globalThis as { __HA_3D_PRINT_CALC_CARD_DEBUG__?: boolean };
    if (g.__HA_3D_PRINT_CALC_CARD_DEBUG__ === true) return true;
    if (typeof localStorage === "undefined") return false;
    return localStorage.getItem("ha_3d_print_calc_card_debug") === "1";
  } catch {
    return false;
  }
}

function dbg(...args: unknown[]): void {
  if (debugEnabled()) console.warn("[ha-3d-print-calc-card]", ...args);
}

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value, (_k, v) => (typeof v === "bigint" ? String(v) : v), 2);
  } catch {
    return String(value);
  }
}

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

function fmtRub(n: number): string {
  return `${n.toFixed(2)} ₽`;
}

type TabId = "calc" | "filaments" | "additionals" | "settings";

export class Ha3dPrintCalcCard extends LitElement {
  @property({ attribute: false }) hass?: HassLike;

  @state() private _tab: TabId = "calc";
  @state() private _filaments: Filament[] = [];
  @state() private _additionals: Additional[] = [];
  @state() private _settings: Settings = { material_factor: 1.1, hourly_rate: 0 };
  @state() private _busy = false;
  @state() private _error: string | undefined;
  @state() private _calcResult: CalcResult | undefined;

  @state() private _filamentId = "";
  @state() private _priceKgManual = "";
  @state() private _massG = "";
  @state() private _printHours = "";
  @state() private _modelsOnTable = "1";
  @state() private _calcExtraRows: { id: string; qty: string }[] = [{ id: "", qty: "0" }];

  @state() private _settingsMaterial = "";
  @state() private _settingsHourly = "";

  static styles = css`
    :host {
      display: block;
    }
    .tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
      border-bottom: 1px solid var(--divider-color);
      padding-bottom: 8px;
    }
    .tabs button {
      font: inherit;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 4px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color, var(--ha-card-background));
      color: var(--primary-text-color);
    }
    .tabs button.active {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      border-color: transparent;
    }
    .grid {
      display: grid;
      gap: 10px;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      align-items: end;
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
    button.action {
      font: inherit;
      color: var(--primary-text-color);
      background: var(--card-background-color, var(--ha-card-background));
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      padding: 8px 10px;
    }
    button.action {
      cursor: pointer;
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      border-color: transparent;
    }
    button.action:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    button.ghost {
      font: inherit;
      cursor: pointer;
      padding: 6px 10px;
      border-radius: 4px;
      border: 1px dashed var(--divider-color);
      background: transparent;
      color: var(--primary-text-color);
    }
    .err {
      color: var(--error-color, #db4437);
      margin: 8px 0;
    }
    .result {
      margin-top: 12px;
      padding: 12px;
      border-radius: 8px;
      background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.04);
    }
    .result h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
    }
    .result table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .result td {
      padding: 4px 8px 4px 0;
    }
    .row-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
    }
    .row-list .line {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: flex-end;
    }
    .filament-row,
    .additional-row {
      display: grid;
      grid-template-columns: 1fr 1fr 100px 36px;
      gap: 8px;
      align-items: end;
      margin-bottom: 8px;
    }
    @media (max-width: 600px) {
      .filament-row,
      .additional-row {
        grid-template-columns: 1fr;
      }
    }
    .small {
      font-size: 11px;
      color: var(--secondary-text-color);
    }
  `;

  setConfig(_config: Record<string, unknown>): void {
    /* no options */
  }

  getCardSize(): number {
    return 6;
  }

  protected willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("hass") && this.hass) {
      const prev = changed.get("hass") as HassLike | undefined;
      if (!prev) {
        void this._loadAll();
      }
    }
  }

  private async _loadAll(): Promise<void> {
    if (!this.hass) return;
    this._error = undefined;
    try {
      const [f, a, s] = await Promise.all([
        callServiceWithResponse<{ filaments?: Filament[] }>(this.hass, "ha_calc", "get_filaments"),
        callServiceWithResponse<{ additionals?: Additional[] }>(this.hass, "ha_calc", "get_additionals"),
        callServiceWithResponse<{ settings?: Settings }>(this.hass, "ha_calc", "get_settings"),
      ]);
      this._filaments = f.filaments ?? [];
      this._additionals = a.additionals ?? [];
      const sett = s.settings ?? { material_factor: 1.1, hourly_rate: 0 };
      this._settings = sett;
      this._settingsMaterial = String(sett.material_factor);
      this._settingsHourly = String(sett.hourly_rate);
    } catch (e) {
      dbg("load error", e);
      this._error = serviceErrorMessage(e);
    }
  }

  private _newId(): string {
    return crypto.randomUUID();
  }

  private async _saveSettings(): Promise<void> {
    if (!this.hass) return;
    const material_factor = Number(this._settingsMaterial);
    const hourly_rate = Number(this._settingsHourly);
    if (Number.isNaN(material_factor) || Number.isNaN(hourly_rate)) {
      this._error = "Некорректное число в настройках";
      return;
    }
    this._busy = true;
    this._error = undefined;
    try {
      const r = await callServiceWithResponse<{ settings?: Settings }>(this.hass, "ha_calc", "set_settings", {
        material_factor,
        hourly_rate,
      });
      if (r.settings) this._settings = r.settings;
    } catch (e) {
      this._error = serviceErrorMessage(e);
    } finally {
      this._busy = false;
    }
  }

  private async _saveFilaments(): Promise<void> {
    if (!this.hass) return;
    this._busy = true;
    this._error = undefined;
    try {
      const filaments = this._filaments.map((x) => ({
        id: x.id,
        name: x.name,
        manufacturer: x.manufacturer ?? "",
        price: Number(x.price),
      }));
      for (const f of filaments) {
        if (!f.id || Number.isNaN(f.price) || f.price < 0) {
          throw new Error("Проверьте строки филаментов (id, цена ≥ 0)");
        }
      }
      const r = await callServiceWithResponse<{ filaments?: Filament[] }>(this.hass, "ha_calc", "set_filaments", {
        filaments,
      });
      this._filaments = r.filaments ?? filaments;
    } catch (e) {
      this._error = serviceErrorMessage(e);
    } finally {
      this._busy = false;
    }
  }

  private async _saveAdditionals(): Promise<void> {
    if (!this.hass) return;
    this._busy = true;
    this._error = undefined;
    try {
      const additionals = this._additionals.map((x) => ({
        id: x.id,
        name: x.name,
        price: Number(x.price),
      }));
      for (const a of additionals) {
        if (!a.id || Number.isNaN(a.price) || a.price < 0) {
          throw new Error("Проверьте доп. материалы (id, цена ≥ 0)");
        }
      }
      const r = await callServiceWithResponse<{ additionals?: Additional[] }>(
        this.hass,
        "ha_calc",
        "set_additionals",
        { additionals }
      );
      this._additionals = r.additionals ?? additionals;
    } catch (e) {
      this._error = serviceErrorMessage(e);
    } finally {
      this._busy = false;
    }
  }

  private _addFilamentRow(): void {
    this._filaments = [
      ...this._filaments,
      { id: this._newId(), name: "", manufacturer: "", price: 0 },
    ];
  }

  private _addAdditionalRow(): void {
    this._additionals = [...this._additionals, { id: this._newId(), name: "", price: 0 }];
  }

  private async _runCalc(): Promise<void> {
    if (!this.hass) return;
    this._busy = true;
    this._error = undefined;
    this._calcResult = undefined;
    const mass_g = Number(this._massG);
    const print_hours = Number(this._printHours);
    const models_on_table = Number(this._modelsOnTable);
    if (Number.isNaN(mass_g) || Number.isNaN(print_hours) || Number.isNaN(models_on_table)) {
      this._error = "Некорректное число";
      this._busy = false;
      return;
    }
    if (models_on_table < 1 || !Number.isInteger(models_on_table)) {
      this._error = "Моделей на столе — целое ≥ 1";
      this._busy = false;
      return;
    }

    const payload: Record<string, unknown> = {
      mass_g,
      print_hours,
      models_on_table,
      additional_lines: this._calcExtraRows
        .filter((r) => r.id && Number(r.qty) > 0)
        .map((r) => ({ id: r.id, qty: Number(r.qty) })),
    };

    if (this._filamentId) {
      payload.filament_id = this._filamentId;
    } else {
      const pk = Number(this._priceKgManual);
      if (Number.isNaN(pk)) {
        this._error = "Укажите филамент или цену ₽/кг";
        this._busy = false;
        return;
      }
      payload.price_kg = pk;
    }

    try {
      const r = await callServiceWithResponse<CalcResult>(this.hass, "ha_calc", "calculate", payload);
      this._calcResult = r;
    } catch (e) {
      dbg("calculate", e, safeJson(e));
      this._error = serviceErrorMessage(e);
    } finally {
      this._busy = false;
    }
  }

  private _renderTabs(): ReturnType<typeof html> {
    const mk = (id: TabId, label: string) => html`
      <button
        type="button"
        class=${this._tab === id ? "active" : ""}
        @click=${() => {
          this._tab = id;
        }}
      >
        ${label}
      </button>
    `;
    return html`<div class="tabs">${mk("calc", "Расчёт")} ${mk("filaments", "Филаменты")} ${mk("additionals", "Дополнительно")}
      ${mk("settings", "Настройки")}</div>`;
  }

  private _renderCalc(): ReturnType<typeof html> {
    return html`
      <div class="grid">
        <label>
          Филамент
          <select
            .value=${this._filamentId}
            @change=${(e: Event) => {
              this._filamentId = (e.target as HTMLSelectElement).value;
            }}
          >
            <option value="">— цена вручную —</option>
            ${this._filaments.map((f) => html`<option value=${f.id}>${f.name} (${f.price} ₽/кг)</option>`)}
          </select>
        </label>
        ${!this._filamentId
          ? html`<label>
              Цена, ₽/кг
              <input
                type="number"
                step="any"
                min="0"
                .value=${this._priceKgManual}
                @input=${(e: Event) => {
                  this._priceKgManual = (e.target as HTMLInputElement).value;
                }}
              />
            </label>`
          : html`<span></span>`}
        <label>
          Масса стола, г
          <input
            type="number"
            step="any"
            min="0"
            .value=${this._massG}
            @input=${(e: Event) => {
              this._massG = (e.target as HTMLInputElement).value;
            }}
          />
        </label>
        <label>
          Печать стола, ч
          <input
            type="number"
            step="any"
            min="0"
            .value=${this._printHours}
            @input=${(e: Event) => {
              this._printHours = (e.target as HTMLInputElement).value;
            }}
          />
        </label>
        <label>
          Моделей на столе
          <input
            type="number"
            step="1"
            min="1"
            .value=${this._modelsOnTable}
            @input=${(e: Event) => {
              this._modelsOnTable = (e.target as HTMLInputElement).value;
            }}
          />
        </label>
      </div>
      <div class="small">Доп. материалы на одну модель (из справочника):</div>
      <div class="row-list">
        ${this._calcExtraRows.map(
          (row, i) => html`
            <div class="line">
              <label>
                Позиция
                <select
                  .value=${row.id}
                  @change=${(e: Event) => {
                    const v = (e.target as HTMLSelectElement).value;
                    const next = [...this._calcExtraRows];
                    next[i] = { ...next[i], id: v };
                    this._calcExtraRows = next;
                  }}
                >
                  <option value="">—</option>
                  ${this._additionals.map((a) => html`<option value=${a.id}>${a.name} (${a.price} ₽)</option>`)}
                </select>
              </label>
              <label>
                Кол-во
                <input
                  type="number"
                  step="any"
                  min="0"
                  .value=${row.qty}
                  @input=${(e: Event) => {
                    const v = (e.target as HTMLInputElement).value;
                    const next = [...this._calcExtraRows];
                    next[i] = { ...next[i], qty: v };
                    this._calcExtraRows = next;
                  }}
                />
              </label>
              <button
                type="button"
                class="ghost"
                @click=${() => {
                  this._calcExtraRows = this._calcExtraRows.filter((_, j) => j !== i);
                  if (this._calcExtraRows.length === 0) this._calcExtraRows = [{ id: "", qty: "0" }];
                }}
              >
                ✕
              </button>
            </div>
          `
        )}
        <button
          type="button"
          class="ghost"
          @click=${() => {
            this._calcExtraRows = [...this._calcExtraRows, { id: "", qty: "0" }];
          }}
        >
          + строка
        </button>
      </div>
      <button type="button" class="action" ?disabled=${this._busy || !this.hass} @click=${() => void this._runCalc()}>
        Считать
      </button>
      ${this._calcResult
        ? html`
            <div class="result">
              <h4>Штука</h4>
              ${this._marginTable(this._calcResult.per_piece)}
              <h4>Весь стол</h4>
              ${this._marginTable(this._calcResult.table_total)}
              <p class="small">
                Стол: пластик ${fmtRub(this._calcResult.breakdown.plastic_table)} · допы
                ${fmtRub(this._calcResult.breakdown.additionals_table)} · машина
                ${fmtRub(this._calcResult.breakdown.machine_table)}
              </p>
              <p class="small">
                На шт.: пластик ${fmtRub(this._calcResult.breakdown.plastic_per_piece)} · допы
                ${fmtRub(this._calcResult.breakdown.additionals_per_piece)} · машина
                ${fmtRub(this._calcResult.breakdown.machine_per_piece)}
              </p>
            </div>
          `
        : null}
    `;
  }

  private _marginTable(m: MarginBlock): ReturnType<typeof html> {
    return html`
      <table>
        <tr>
          <td>Себестоимость</td>
          <td>${fmtRub(m.landed)}</td>
        </tr>
        <tr>
          <td>Цена при марже 60%</td>
          <td>${fmtRub(m.price_margin_60)}</td>
        </tr>
        <tr>
          <td>Цена при марже 75%</td>
          <td>${fmtRub(m.price_margin_75)}</td>
        </tr>
        <tr>
          <td>Цена при марже 80%</td>
          <td>${fmtRub(m.price_margin_80)}</td>
        </tr>
      </table>
    `;
  }

  private _renderFilaments(): ReturnType<typeof html> {
    return html`
      <p class="small">Полная замена списка при сохранении.</p>
      ${this._filaments.map(
        (f, i) => html`
          <div class="filament-row">
            <label>
              Название
              <input
                .value=${f.name}
                @input=${(e: Event) => {
                  const v = (e.target as HTMLInputElement).value;
                  const next = [...this._filaments];
                  next[i] = { ...next[i], name: v };
                  this._filaments = next;
                }}
              />
            </label>
            <label>
              Производитель
              <input
                .value=${f.manufacturer ?? ""}
                @input=${(e: Event) => {
                  const v = (e.target as HTMLInputElement).value;
                  const next = [...this._filaments];
                  next[i] = { ...next[i], manufacturer: v };
                  this._filaments = next;
                }}
              />
            </label>
            <label>
              ₽/кг
              <input
                type="number"
                step="any"
                min="0"
                .value=${String(f.price)}
                @input=${(e: Event) => {
                  const v = Number((e.target as HTMLInputElement).value);
                  const next = [...this._filaments];
                  next[i] = { ...next[i], price: v };
                  this._filaments = next;
                }}
              />
            </label>
            <button
              type="button"
              class="ghost"
              @click=${() => {
                this._filaments = this._filaments.filter((_, j) => j !== i);
              }}
            >
              ✕
            </button>
          </div>
        `
      )}
      <button type="button" class="ghost" @click=${() => this._addFilamentRow()}>+ филамент</button>
      <div style="margin-top:12px">
        <button type="button" class="action" ?disabled=${this._busy || !this.hass} @click=${() => void this._saveFilaments()}>
          Сохранить филаменты
        </button>
      </div>
    `;
  }

  private _renderAdditionals(): ReturnType<typeof html> {
    return html`
      <p class="small">Доп. позиции (цена за единицу). Полная замена при сохранении.</p>
      ${this._additionals.map(
        (a, i) => html`
          <div class="additional-row">
            <label>
              Название
              <input
                .value=${a.name}
                @input=${(e: Event) => {
                  const v = (e.target as HTMLInputElement).value;
                  const next = [...this._additionals];
                  next[i] = { ...next[i], name: v };
                  this._additionals = next;
                }}
              />
            </label>
            <label>
              ₽/ед.
              <input
                type="number"
                step="any"
                min="0"
                .value=${String(a.price)}
                @input=${(e: Event) => {
                  const v = Number((e.target as HTMLInputElement).value);
                  const next = [...this._additionals];
                  next[i] = { ...next[i], price: v };
                  this._additionals = next;
                }}
              />
            </label>
            <span class="small">id: ${a.id.slice(0, 8)}…</span>
            <button
              type="button"
              class="ghost"
              @click=${() => {
                this._additionals = this._additionals.filter((_, j) => j !== i);
              }}
            >
              ✕
            </button>
          </div>
        `
      )}
      <button type="button" class="ghost" @click=${() => this._addAdditionalRow()}>+ позиция</button>
      <div style="margin-top:12px">
        <button
          type="button"
          class="action"
          ?disabled=${this._busy || !this.hass}
          @click=${() => void this._saveAdditionals()}
        >
          Сохранить доп. материалы
        </button>
      </div>
    `;
  }

  private _renderSettings(): ReturnType<typeof html> {
    return html`
      <div class="grid">
        <label>
          Коэффициент материала
          <input
            type="number"
            step="any"
            min="0.01"
            .value=${this._settingsMaterial}
            @input=${(e: Event) => {
              this._settingsMaterial = (e.target as HTMLInputElement).value;
            }}
          />
        </label>
        <label>
          Ставка машины, ₽/ч
          <input
            type="number"
            step="any"
            min="0"
            .value=${this._settingsHourly}
            @input=${(e: Event) => {
              this._settingsHourly = (e.target as HTMLInputElement).value;
            }}
          />
        </label>
      </div>
      <button type="button" class="action" ?disabled=${this._busy || !this.hass} @click=${() => void this._saveSettings()}>
        Сохранить настройки
      </button>
    `;
  }

  protected render(): ReturnType<typeof html> {
    return html`
      <ha-card>
        <div class="card-content">
          ${this._renderTabs()}
          ${this._error ? html`<div class="err">${this._error}</div>` : null}
          ${this._tab === "calc" ? this._renderCalc() : null}
          ${this._tab === "filaments" ? this._renderFilaments() : null}
          ${this._tab === "additionals" ? this._renderAdditionals() : null}
          ${this._tab === "settings" ? this._renderSettings() : null}
        </div>
      </ha-card>
    `;
  }
}

const TAG = "ha-3d-print-calc-card";
if (!customElements.get(TAG)) {
  customElements.define(TAG, Ha3dPrintCalcCard);
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-3d-print-calc-card": Ha3dPrintCalcCard;
  }
}
