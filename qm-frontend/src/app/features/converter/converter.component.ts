import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MeasurementService } from '../../core/services/measurement.service';
import { AuthModalComponent } from '../auth/auth-modal.component';
import {
  MeasurementType,
  MeasurementResponse,
  UNIT_MAP,
  UnitOption,
} from '../../core/models/models';

type OperationMode = 'convert' | 'add' | 'subtract' | 'divide' | 'compare';

@Component({
  selector: 'app-converter',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AuthModalComponent],
  templateUrl: './converter.component.html',
  styleUrls: ['./converter.component.scss'],
})
export class ConverterComponent implements OnInit {
  showAuthModal = signal(false);

  selectedCategory = signal<MeasurementType>('LENGTH');
  operationMode = signal<OperationMode>('convert');

  fromUnit = signal('FEET');
  toUnit = signal('INCHES');
  value1 = signal<number | null>(10);
  value2 = signal<number | null>(null);
  unit2 = signal('YARDS');

  result = signal<MeasurementResponse | null>(null);
  loading = signal(false);
  error = signal('');

  categories: MeasurementType[] = ['LENGTH', 'WEIGHT', 'VOLUME', 'TEMPERATURE'];
  operations: { key: OperationMode; label: string }[] = [
    { key: 'convert', label: 'Convert' },
    { key: 'add', label: 'Add' },
    { key: 'subtract', label: 'Subtract' },
    { key: 'divide', label: 'Divide' },
    { key: 'compare', label: 'Compare' },
  ];

  unitOptions = computed(() => UNIT_MAP[this.selectedCategory()]);

  needsSecondInput = computed(() =>
    ['add', 'subtract', 'divide', 'compare'].includes(this.operationMode())
  );

  resultLabel = computed(() => {
    const r = this.result();
    if (!r) return '';
    const mode = this.operationMode();
    if (mode === 'compare') return r.isEqual ? '✓ Equal' : '✗ Not Equal';
    const v1 = this.value1();
    const fromSym = this.getSymbol(this.fromUnit());
    const toSym = this.getSymbol(this.toUnit());
    const val = this.formatValue(r.value);
    if (mode === 'convert') return `${v1} ${fromSym} = ${val} ${toSym}`;
    const v2 = this.value2();
    const u2Sym = this.getSymbol(this.unit2());
    const op = mode === 'add' ? '+' : mode === 'subtract' ? '−' : '÷';
    const resultUnit = this.getSymbol(r.unit) || r.unit;
    return `${v1} ${fromSym} ${op} ${v2} ${u2Sym} = ${val} ${resultUnit}`;
  });

  constructor(public auth: AuthService, private svc: MeasurementService) {}

  ngOnInit() {
    this.setDefaultUnits();
  }

  selectCategory(cat: MeasurementType) {
    this.selectedCategory.set(cat);
    this.result.set(null);
    this.error.set('');
    this.setDefaultUnits();
  }

  setDefaultUnits() {
    const opts = UNIT_MAP[this.selectedCategory()];
    this.fromUnit.set(opts[0].value);
    this.toUnit.set(opts[1]?.value || opts[0].value);
    this.unit2.set(opts[1]?.value || opts[0].value);
  }

  // All operations available to everyone — no login required
  selectOperation(op: OperationMode) {
    this.operationMode.set(op);
    this.result.set(null);
    this.error.set('');
  }

  swapUnits() {
    const tmp = this.fromUnit();
    this.fromUnit.set(this.toUnit());
    this.toUnit.set(tmp);
    this.result.set(null);
  }

  execute() {
    const v1 = this.value1();
    if (v1 === null || isNaN(Number(v1))) {
      this.error.set('Please enter a valid value.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.result.set(null);

    const type = this.selectedCategory();
    const mode = this.operationMode();
    const qty1 = { value: Number(v1), unit: this.fromUnit(), type };

    if (mode === 'convert') {
      this.svc.convert({ quantity: qty1, targetUnit: this.toUnit() }).subscribe({
        next: r => { this.result.set(r); this.loading.set(false); },
        error: e => { this.error.set(e.error?.message || 'Conversion failed.'); this.loading.set(false); },
      });
    } else {
      const v2 = this.value2();
      if (v2 === null || isNaN(Number(v2))) {
        this.error.set('Please enter a valid second value.');
        this.loading.set(false);
        return;
      }
      const qty2 = { value: Number(v2), unit: this.unit2(), type };
      const req = { quantity1: qty1, quantity2: qty2 };

      const obs$ =
        mode === 'add' ? this.svc.add(req) :
        mode === 'subtract' ? this.svc.subtract(req) :
        mode === 'divide' ? this.svc.divide(req) :
        this.svc.compare(req);

      obs$.subscribe({
        next: r => { this.result.set(r); this.loading.set(false); },
        error: e => { this.error.set(e.error?.message || 'Operation failed.'); this.loading.set(false); },
      });
    }
  }

  getSymbol(unit: string): string {
    for (const opts of Object.values(UNIT_MAP)) {
      const found = (opts as UnitOption[]).find(o => o.value === unit);
      if (found) return found.symbol;
    }
    return unit;
  }

  formatValue(v: number): string {
    if (Number.isInteger(v)) return v.toString();
    return parseFloat(v.toFixed(6)).toString();
  }

  getCategoryIcon(cat: string): string {
    const icons: Record<string, string> = {
      LENGTH: '↔',
      WEIGHT: '⚖',
      VOLUME: '🧪',
      TEMPERATURE: '🌡',
    };
    return icons[cat] || '→';
  }

  handleAuthClick(event: Event) {
    if (!this.auth.isLoggedIn()) {
      event.preventDefault();
      this.showAuthModal.set(true);
    }
  }

  onValue1Input(event: Event) {
    this.value1.set(+(event.target as HTMLInputElement).value);
    this.result.set(null);
  }

  onValue2Input(event: Event) {
    this.value2.set(+(event.target as HTMLInputElement).value);
    this.result.set(null);
  }

  onFromUnitChange(event: Event) {
    this.fromUnit.set((event.target as HTMLSelectElement).value);
    this.result.set(null);
  }

  onToUnitChange(event: Event) {
    this.toUnit.set((event.target as HTMLSelectElement).value);
    this.result.set(null);
  }

  onUnit2Change(event: Event) {
    this.unit2.set((event.target as HTMLSelectElement).value);
    this.result.set(null);
  }

  selectUnitFromSidebar(unit: string) {
    this.fromUnit.set(unit);
    this.result.set(null);
  }

  onAuthSuccess() {
    this.showAuthModal.set(false);
  }
}
