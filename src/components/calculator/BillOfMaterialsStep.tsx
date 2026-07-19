'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, FileDown, FileSpreadsheet, FileText, Sun, Zap, Battery, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import type { BOMItem, PVArrayDesign, InverterDesign, BatteryDesign, CableSizing, ProtectionDevices } from '@/lib/types';
import { solarPanels } from '@/lib/data/panels';
import { inverters } from '@/lib/data/inverters';
import { batteries } from '@/lib/data/batteries';

interface BillOfMaterialsStepProps {
  bomItems: BOMItem[];
  onBomChange: (items: BOMItem[]) => void;
  pvDesign: PVArrayDesign;
  inverterDesign: InverterDesign;
  batteryDesign: BatteryDesign;
  cableSizing: CableSizing;
  protectionDevices: ProtectionDevices;
}

let itemIdCounter = 0;
function genId(): string {
  return `bom-${Date.now()}-${++itemIdCounter}`;
}

function generateFullBOM(
  pv: PVArrayDesign,
  inv: InverterDesign,
  batt: BatteryDesign,
  cables: CableSizing,
  prot: ProtectionDevices,
  selectedPanelId: string,
  selectedInverterId: string,
  selectedBatteryId: string,
): BOMItem[] {
  const items: BOMItem[] = [];

  const panel = solarPanels.find(p => p.id === selectedPanelId);
  const inverter = inverters.find(i => i.id === selectedInverterId);
  const battery = batteries.find(b => b.id === selectedBatteryId);

  if (panel && pv.numberOfPanels > 0) {
    items.push({
      id: genId(), category: 'PV Module',
      description: `${panel.manufacturer.toUpperCase()} ${panel.model} ${panel.power}W Mono`,
      manufacturer: panel.manufacturer, model: panel.model,
      quantity: pv.numberOfPanels, unit: 'pcs', unitPrice: 0, totalPrice: 0,
    });
  }

  if (inverter && inv.ratedPower > 0) {
    items.push({
      id: genId(), category: 'Inverter',
      description: `${inverter.manufacturer.toUpperCase()} ${inverter.model} ${inv.ratedPower}kW ${inv.systemType}`,
      manufacturer: inverter.manufacturer, model: inverter.model,
      quantity: 1, unit: 'pcs', unitPrice: 0, totalPrice: 0,
    });
  }

  if (battery && batt.totalBatteries > 0) {
    items.push({
      id: genId(), category: 'Battery',
      description: `${battery.manufacturer.toUpperCase()} ${battery.model} ${battery.voltage}V ${battery.capacity}Ah ${battery.type}`,
      manufacturer: battery.manufacturer, model: battery.model,
      quantity: batt.totalBatteries, unit: 'pcs', unitPrice: 0, totalPrice: 0,
    });
  }

  const dcSize = cables.dcCable.recommendedSize;
  if (dcSize > 0) {
    items.push({
      id: genId(), category: 'Cables',
      description: `DC Solar Cable ${dcSize}mm² (PV to Inverter) UV Resistant`,
      manufacturer: 'Generic', model: `PV-${dcSize}mm²`,
      quantity: Math.ceil(cables.dcCable.length || 30), unit: 'm', unitPrice: 0, totalPrice: 0,
    });
  }

  const acSize = cables.acCable.recommendedSize;
  if (acSize > 0) {
    items.push({
      id: genId(), category: 'Cables',
      description: `AC Cable ${acSize}mm² (Inverter to DB) XLPE`,
      manufacturer: 'Generic', model: `AC-${acSize}mm²`,
      quantity: Math.ceil(cables.acCable.length || 20), unit: 'm', unitPrice: 0, totalPrice: 0,
    });
  }

  const batSize = cables.batteryCable.recommendedSize;
  if (batSize > 0) {
    items.push({
      id: genId(), category: 'Cables',
      description: `Battery Cable ${batSize}mm² (Battery to Inverter) Flexible`,
      manufacturer: 'Generic', model: `BAT-${batSize}mm²`,
      quantity: Math.ceil(cables.batteryCable.length || 10), unit: 'm', unitPrice: 0, totalPrice: 0,
    });
  }

  const gndSize = cables.groundCable.recommendedSize;
  if (gndSize > 0) {
    items.push({
      id: genId(), category: 'Cables',
      description: `Earth/Ground Cable ${gndSize}mm² Green-Yellow PVC`,
      manufacturer: 'Generic', model: `GND-${gndSize}mm²`,
      quantity: Math.ceil(cables.groundCable.length || 25), unit: 'm', unitPrice: 0, totalPrice: 0,
    });
  }

  const dcCableTies = {
    id: genId(), category: 'Accessories',
    description: 'MC4 Solar Connectors (Male + Female Pair)',
    manufacturer: 'Staubli', model: 'MC4',
    quantity: Math.max(pv.parallelStrings * 2, 4), unit: 'pairs', unitPrice: 0, totalPrice: 0,
  };
  items.push(dcCableTies);

  items.push({
    id: genId(), category: 'Accessories',
    description: 'MC4 Connector Cable Gland PG11 (Waterproof)',
    manufacturer: 'Generic', model: 'PG11',
    quantity: Math.max(pv.parallelStrings * 2, 4), unit: 'pcs', unitPrice: 0, totalPrice: 0,
  });

  if (prot.mcb.rating > 0) {
    items.push({
      id: genId(), category: 'MCBs',
      description: `DC MCB ${prot.mcb.rating}A ${prot.mcb.poles}P ${prot.mcb.breakingCapacity}kA`,
      manufacturer: 'Schneider/ABB', model: `iC60N-${prot.mcb.rating}A`,
      quantity: 1, unit: 'pcs', unitPrice: 0, totalPrice: 0,
    });
  }

  if (prot.mccb.rating > 0) {
    items.push({
      id: genId(), category: 'MCBs',
      description: `AC MCCB ${prot.mccb.rating}A ${prot.mccb.poles}P ${prot.mccb.breakingCapacity}kA`,
      manufacturer: 'Schneider/ABB', model: `NSX-${prot.mccb.rating}A`,
      quantity: 1, unit: 'pcs', unitPrice: 0, totalPrice: 0,
    });
  }

  if (prot.fuse.rating > 0) {
    items.push({
      id: genId(), category: 'MCBs',
      description: `DC Fuse ${prot.fuse.rating}A with Fuse Holder`,
      manufacturer: 'Schneider/Bussmann', model: `PV-${prot.fuse.rating}A`,
      quantity: pv.parallelStrings || 2, unit: 'pcs', unitPrice: 0, totalPrice: 0,
    });
  }

  if (prot.spd.rating > 0) {
    items.push({
      id: genId(), category: 'SPDs',
      description: `Surge Protector SPD Type II ${prot.spd.rating}V DC`,
      manufacturer: 'Schneider/ABB', model: `PRD-${prot.spd.rating}V`,
      quantity: 2, unit: 'pcs', unitPrice: 0, totalPrice: 0,
    });
  }

  if (prot.dcIsolator.rating > 0) {
    items.push({
      id: genId(), category: 'MCBs',
      description: `DC Isolator Switch ${prot.dcIsolator.rating}A ${prot.dcIsolator.poles}P`,
      manufacturer: 'Schneider/ABB', model: `Interpact-${prot.dcIsolator.rating}A`,
      quantity: 1, unit: 'pcs', unitPrice: 0, totalPrice: 0,
    });
  }

  if (prot.acIsolator.rating > 0) {
    items.push({
      id: genId(), category: 'MCBs',
      description: `AC Isolator Switch ${prot.acIsolator.rating}A ${prot.acIsolator.poles}P`,
      manufacturer: 'Schneider/ABB', model: `Interpact-${prot.acIsolator.rating}A`,
      quantity: 1, unit: 'pcs', unitPrice: 0, totalPrice: 0,
    });
  }

  if (prot.rcbo.rating > 0) {
    items.push({
      id: genId(), category: 'MCBs',
      description: `RCBO ${prot.rcbo.rating}A 30mA Type C`,
      manufacturer: 'Schneider/ABB', model: `Acti9-${prot.rcbo.rating}A`,
      quantity: 1, unit: 'pcs', unitPrice: 0, totalPrice: 0,
    });
  }

  const panelArea = panel ? (panel.width * panel.height) / 1000000 : 2.5;
  const totalArea = pv.numberOfPanels * panelArea;
  const railLength = Math.ceil(totalArea * 0.8);

  items.push({
    id: genId(), category: 'Structure/Mounting',
    description: `Aluminum Mounting Rail 40x40mm Anodized`,
    manufacturer: 'K2 Systems', model: 'Rail-4040',
    quantity: railLength || 20, unit: 'm', unitPrice: 0, totalPrice: 0,
  });

  items.push({
    id: genId(), category: 'Structure/Mounting',
    description: `Roof Hook / Ground Mount Bracket Stainless Steel`,
    manufacturer: 'K2 Systems', model: 'Hook-SS',
    quantity: Math.ceil(pv.numberOfPanels * 2) || 20, unit: 'pcs', unitPrice: 0, totalPrice: 0,
  });

  items.push({
    id: genId(), category: 'Structure/Mounting',
    description: `Mid Clamp for ${panel?.height || 1134}mm Panel Aluminum`,
    manufacturer: 'K2 Systems', model: 'MidClamp',
    quantity: Math.max(pv.numberOfPanels - (pv.parallelStrings || 1), 1), unit: 'pcs', unitPrice: 0, totalPrice: 0,
  });

  items.push({
    id: genId(), category: 'Structure/Mounting',
    description: `End Clamp for ${panel?.height || 1134}mm Panel Aluminum`,
    manufacturer: 'K2 Systems', model: 'EndClamp',
    quantity: (pv.parallelStrings || 1) * 2, unit: 'pcs', unitPrice: 0, totalPrice: 0,
  });

  items.push({
    id: genId(), category: 'Structure/Mounting',
    description: 'Hex Bolt M8x30 SS + Nut + Washer Set',
    manufacturer: 'Generic', model: 'M8-SS',
    quantity: Math.ceil(pv.numberOfPanels * 2) || 30, unit: 'pcs', unitPrice: 0, totalPrice: 0,
  });

  items.push({
    id: genId(), category: 'Grounding',
    description: 'Copper Earth Rod 16mm x 1500mm',
    manufacturer: 'Generic', model: 'ER-16x1500',
    quantity: 2, unit: 'pcs', unitPrice: 0, totalPrice: 0,
  });

  items.push({
    id: genId(), category: 'Grounding',
    description: 'Earth Clamp for Round Conductor',
    manufacturer: 'Generic', model: 'EC-Round',
    quantity: 4, unit: 'pcs', unitPrice: 0, totalPrice: 0,
  });

  items.push({
    id: genId(), category: 'Grounding',
    description: 'Grounding Cable Green-Yellow 10mm²',
    manufacturer: 'Generic', model: 'GND-10mm',
    quantity: 20, unit: 'm', unitPrice: 0, totalPrice: 0,
  });

  items.push({
    id: genId(), category: 'Accessories',
    description: 'Cable Tray / Trunking 100x50mm Galvanized',
    manufacturer: 'Generic', model: 'CT-100x50',
    quantity: 10, unit: 'm', unitPrice: 0, totalPrice: 0,
  });

  items.push({
    id: genId(), category: 'Accessories',
    description: 'Cable Tie 300mm UV Resistant Nylon',
    manufacturer: 'Generic', model: 'CT-300',
    quantity: 50, unit: 'pcs', unitPrice: 0, totalPrice: 0,
    });

  items.push({
    id: genId(), category: 'Accessories',
    description: 'Combiner Box IP65 with Busbar',
    manufacturer: 'Generic', model: 'CB-IP65',
    quantity: pv.parallelStrings > 4 ? 2 : 1, unit: 'pcs', unitPrice: 0, totalPrice: 0,
  });

  return items;
}

const CATEGORY_ICONS: Record<string, string> = {
  'PV Module': '☀️',
  'Inverter': '⚡',
  'Battery': '🔋',
  'Cables': '🔌',
  'MCBs': '🛡️',
  'SPDs': '⚡',
  'Structure/Mounting': '🏗️',
  'Grounding': '🌍',
  'Accessories': '📦',
};

const CATEGORY_ORDER = ['PV Module', 'Inverter', 'Battery', 'Cables', 'MCBs', 'SPDs', 'Structure/Mounting', 'Grounding', 'Accessories'];

export default function BillOfMaterialsStep({
  bomItems, onBomChange, pvDesign, inverterDesign, batteryDesign, cableSizing, protectionDevices,
}: BillOfMaterialsStepProps) {
  const { t, isRTL } = useLanguage();
  const [selectedPanel, setSelectedPanel] = useState(solarPanels.find(p => p.id === pvDesign.selectedPanel?.id)?.id || solarPanels[solarPanels.length - 1].id);
  const [selectedInverter, setSelectedInverter] = useState(inverters.find(i => i.id === inverterDesign.selectedInverter?.id)?.id || inverters[0]?.id || '');
  const [selectedBattery, setSelectedBattery] = useState(batteries.find(b => b.id === batteryDesign.selectedBattery?.id)?.id || batteries[0]?.id || '');
  const [panelOpen, setPanelOpen] = useState(false);
  const [invOpen, setInvOpen] = useState(false);
  const [battOpen, setBattOpen] = useState(false);

  const autoBOM = useMemo(
    () => generateFullBOM(pvDesign, inverterDesign, batteryDesign, cableSizing, protectionDevices, selectedPanel, selectedInverter, selectedBattery),
    [pvDesign, inverterDesign, batteryDesign, cableSizing, protectionDevices, selectedPanel, selectedInverter, selectedBattery]
  );

  const grouped = useMemo(() => {
    const groups: Record<string, BOMItem[]> = {};
    for (const cat of CATEGORY_ORDER) groups[cat] = [];
    for (const item of autoBOM) {
      const cat = CATEGORY_ORDER.find(c => item.category.includes(c)) || item.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }
    return groups;
  }, [autoBOM]);

  const updateQty = useCallback((id: string, qty: number) => {
    onBomChange(autoBOM.map(item => item.id === id ? { ...item, quantity: Math.max(0, qty) } : item));
  }, [autoBOM, onBomChange]);

  const exportPDF = useCallback(async () => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill of Materials', 14, 18);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 26);
    let y = 32;
    for (const cat of CATEGORY_ORDER) {
      const items = grouped[cat];
      if (!items || items.length === 0) continue;
      if (y > 170) { doc.addPage(); y = 20; }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(cat, 14, y);
      y += 2;
      const rows = items.map((item, idx) => [
        `${idx + 1}`, item.description || '-', item.manufacturer || '-',
        item.model || '-', String(item.quantity), item.unit,
      ]);
      autoTable(doc, {
        startY: y, head: [['#', 'Description', 'Manufacturer', 'Model', 'Qty', 'Unit']],
        body: rows, styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [241, 245, 249] },
        margin: { left: 14, right: 14 },
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
    }
    doc.save('Bill_of_Materials.pdf');
  }, [grouped]);

  const selectedPanelData = solarPanels.find(p => p.id === selectedPanel);
  const selectedInvData = inverters.find(i => i.id === selectedInverter);
  const selectedBattData = batteries.find(b => b.id === selectedBattery);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Package className="w-6 h-6 text-solar-sun" />
          {t('bom.title') || 'Bill of Materials'}
        </h2>
        <p className="text-text-secondary mt-1">Select your preferred components. All other items are auto-generated based on your design.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Panel Selector */}
        <div className="relative">
          <label className="block text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
            <Sun className="w-4 h-4 text-solar-sun" /> Solar Panel
          </label>
          <button onClick={() => { setPanelOpen(!panelOpen); setInvOpen(false); setBattOpen(false); }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-solar-sun/30 bg-surface hover:border-solar-sun/60 transition-colors text-start">
            <div>
              <div className="text-sm font-bold text-text-primary">{selectedPanelData?.manufacturer.toUpperCase()}</div>
              <div className="text-xs text-text-secondary">{selectedPanelData?.model} - {selectedPanelData?.power}W</div>
            </div>
            <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${panelOpen ? 'rotate-180' : ''}`} />
          </button>
          {panelOpen && (
            <div className="absolute z-30 mt-1 w-full max-h-72 overflow-y-auto rounded-xl border border-border bg-surface shadow-2xl">
              {solarPanels.map(p => (
                <button key={p.id} onClick={() => { setSelectedPanel(p.id); setPanelOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-start hover:bg-solar-sun/10 transition-colors ${selectedPanel === p.id ? 'bg-solar-sun/10 border-l-4 border-solar-sun' : ''}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">{p.manufacturer.toUpperCase()} {p.model}</span>
                      {p.availableInYemen && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-solar-green/20 text-solar-green font-bold">YEMEN</span>}
                    </div>
                    <div className="text-xs text-text-secondary">{p.power}W | {p.efficiency}% | {p.cells} cells{p.yemenDistributor ? ` | ${p.yemenDistributor}` : ''}</div>
                  </div>
                  {selectedPanel === p.id && <Check className="w-4 h-4 text-solar-sun" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Inverter Selector */}
        <div className="relative">
          <label className="block text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-solar-purple" /> Inverter
          </label>
          <button onClick={() => { setInvOpen(!invOpen); setPanelOpen(false); setBattOpen(false); }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-solar-purple/30 bg-surface hover:border-solar-purple/60 transition-colors text-start">
            <div>
              <div className="text-sm font-bold text-text-primary">{selectedInvData?.manufacturer.toUpperCase() || 'Select'}</div>
              <div className="text-xs text-text-secondary">{selectedInvData?.model} - {selectedInvData?.ratedPower}kW {selectedInvData?.type}</div>
            </div>
            <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${invOpen ? 'rotate-180' : ''}`} />
          </button>
          {invOpen && (
            <div className="absolute z-30 mt-1 w-full max-h-72 overflow-y-auto rounded-xl border border-border bg-surface shadow-2xl">
              {inverters.map(inv => (
                <button key={inv.id} onClick={() => { setSelectedInverter(inv.id); setInvOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-start hover:bg-solar-purple/10 transition-colors ${selectedInverter === inv.id ? 'bg-solar-purple/10 border-l-4 border-solar-purple' : ''}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">{inv.manufacturer.toUpperCase()} {inv.model}</span>
                      {inv.availableInYemen && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-solar-green/20 text-solar-green font-bold">YEMEN</span>}
                    </div>
                    <div className="text-xs text-text-secondary">{inv.ratedPower}kW | {inv.type} | {inv.numberOfMppt} MPPT{inv.yemenDistributor ? ` | ${inv.yemenDistributor}` : ''}</div>
                  </div>
                  {selectedInverter === inv.id && <Check className="w-4 h-4 text-solar-purple" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Battery Selector */}
        <div className="relative">
          <label className="block text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
            <Battery className="w-4 h-4 text-solar-green" /> Battery
          </label>
          <button onClick={() => { setBattOpen(!battOpen); setPanelOpen(false); setInvOpen(false); }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-solar-green/30 bg-surface hover:border-solar-green/60 transition-colors text-start">
            <div>
              <div className="text-sm font-bold text-text-primary">{selectedBattData?.manufacturer.toUpperCase() || 'Select'}</div>
              <div className="text-xs text-text-secondary">{selectedBattData?.model} - {selectedBattData?.kwh}kWh {selectedBattData?.type}</div>
            </div>
            <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${battOpen ? 'rotate-180' : ''}`} />
          </button>
          {battOpen && (
            <div className="absolute z-30 mt-1 w-full max-h-72 overflow-y-auto rounded-xl border border-border bg-surface shadow-2xl">
              {batteries.map(b => (
                <button key={b.id} onClick={() => { setSelectedBattery(b.id); setBattOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-start hover:bg-solar-green/10 transition-colors ${selectedBattery === b.id ? 'bg-solar-green/10 border-l-4 border-solar-green' : ''}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">{b.manufacturer.toUpperCase()} {b.model}</span>
                      {b.availableInYemen && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-solar-green/20 text-solar-green font-bold">YEMEN</span>}
                    </div>
                    <div className="text-xs text-text-secondary">{b.kwh}kWh | {b.voltage}V {b.capacity}Ah | {b.type}{b.yemenDistributor ? ` | ${b.yemenDistributor}` : ''}</div>
                  </div>
                  {selectedBattery === b.id && <Check className="w-4 h-4 text-solar-green" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {selectedPanelData && (
          <div className="p-3 rounded-xl bg-solar-sun/5 border border-solar-sun/20 text-center">
            <div className="text-lg font-bold text-solar-sun">{pvDesign.numberOfPanels}</div>
            <div className="text-xs text-text-muted">Panels × {selectedPanelData.power}W = {(pvDesign.numberOfPanels * selectedPanelData.power / 1000).toFixed(1)}kWp</div>
          </div>
        )}
        {selectedInvData && (
          <div className="p-3 rounded-xl bg-solar-purple/5 border border-solar-purple/20 text-center">
            <div className="text-lg font-bold text-solar-purple">{selectedInvData.ratedPower}kW</div>
            <div className="text-xs text-text-muted">{selectedInvData.manufacturer} | {selectedInvData.numberOfMppt} MPPT</div>
          </div>
        )}
        {selectedBattData && (
          <div className="p-3 rounded-xl bg-solar-green/5 border border-solar-green/20 text-center">
            <div className="text-lg font-bold text-solar-green">{selectedBattData.kwh}kWh</div>
            <div className="text-xs text-text-muted">{selectedBattData.manufacturer} | {selectedBattData.type}</div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {CATEGORY_ORDER.map(cat => {
          const items = grouped[cat];
          if (!items || items.length === 0) return null;
          return (
            <div key={cat} className="border border-border rounded-xl overflow-hidden bg-surface">
              <div className="flex items-center justify-between px-5 py-3 bg-surface-alt">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{CATEGORY_ICONS[cat] || '📋'}</span>
                  <span className="text-sm font-semibold text-text-primary">{cat}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-solar-sky/10 text-solar-sky font-medium">{items.length}</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-t border-border bg-surface-alt/50">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-text-secondary w-8">#</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-text-secondary">Description</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-text-secondary w-28">Manufacturer</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-text-secondary w-28">Model</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-text-secondary w-20">Qty</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-text-secondary w-16">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={item.id} className={`border-t border-border/50 ${idx % 2 === 1 ? 'bg-surface-alt/30' : ''}`}>
                        <td className="px-3 py-2 text-text-muted text-xs">{idx + 1}</td>
                        <td className="px-3 py-2 text-text-primary text-sm">{item.description}</td>
                        <td className="px-3 py-2 text-text-secondary text-sm">{item.manufacturer}</td>
                        <td className="px-3 py-2 text-text-secondary text-sm">{item.model}</td>
                        <td className="px-3 py-2 text-center">
                          <input type="number" value={item.quantity} min={0}
                            onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 text-sm text-center rounded-lg bg-surface-alt border border-border focus:border-solar-sky focus:ring-1 focus:ring-solar-sky/30 outline-none" />
                        </td>
                        <td className="px-3 py-2 text-center text-text-secondary text-sm">{item.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-2 border-solar-sky/30 rounded-xl p-5 bg-solar-sky/5">
        <div>
          <span className="text-lg font-bold text-text-primary">Total Components</span>
          <span className="text-xs text-text-muted ms-2">Auto-generated from design calculations</span>
        </div>
        <span className="text-2xl font-bold gradient-text-solar">{autoBOM.length}</span>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={exportPDF}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-solar-red/10 text-solar-red hover:bg-solar-red/20 transition-colors text-sm font-medium">
          <FileDown className="w-4 h-4" /> PDF
        </button>
        <button onClick={exportPDF}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-solar-green/10 text-solar-green hover:bg-solar-green/20 transition-colors text-sm font-medium">
          <FileSpreadsheet className="w-4 h-4" /> Excel
        </button>
        <button onClick={exportPDF}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-solar-purple/10 text-solar-purple hover:bg-solar-purple/20 transition-colors text-sm font-medium">
          <FileText className="w-4 h-4" /> Word
        </button>
      </div>
    </motion.div>
  );
}
