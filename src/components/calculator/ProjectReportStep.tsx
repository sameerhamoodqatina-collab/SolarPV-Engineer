'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  FileText,
  Printer,
  Download,
  ClipboardCheck,
  Zap,
  Sun,
  Battery,
  Cable,
  Shield,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Info,
  LayoutList,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import type {
  ProjectInfo,
  LoadProfile,
  SolarResource,
  PVArrayDesign,
  BatteryDesign,
  InverterDesign,
  CableSizing,
  ProtectionDevices,
  BOMItem,
  FinancialAnalysis,
} from '@/lib/types';

interface ProjectReportStepProps {
  projectInfo: ProjectInfo;
  loadProfile: LoadProfile;
  solarResource: SolarResource;
  pvDesign: PVArrayDesign;
  batteryDesign: BatteryDesign;
  inverterDesign: InverterDesign;
  cableSizing: CableSizing;
  protectionDevices: ProtectionDevices;
  bomItems: BOMItem[];
  financialAnalysis: FinancialAnalysis;
}

interface ReportSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

function fmt(n: number, decimals = 1) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function ProjectReportStep({
  projectInfo,
  loadProfile,
  solarResource,
  pvDesign,
  batteryDesign,
  inverterDesign,
  cableSizing,
  protectionDevices,
  bomItems,
  financialAnalysis,
}: ProjectReportStepProps) {
  const { t } = useLanguage();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['executive', 'project', 'site', 'load', 'energy', 'solarResource', 'pvArray', 'battery', 'inverter', 'cable', 'protection', 'sld', 'notes', 'warnings', 'recommendations', 'standards', 'appendix'])
  );

  const toggle = useCallback((id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    const allIds = getSections().map((s) => s.id);
    setExpandedSections(new Set(allIds));
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedSections(new Set());
  }, []);

  function getSections(): ReportSection[] {
    return [
      {
        id: 'executive',
        title: t('report.executiveSummary'),
        icon: <ClipboardCheck className="w-4 h-4" />,
        content: (
          <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
            <p>
              This engineering report presents the complete design of a{' '}
              {projectInfo.application} solar photovoltaic system for{' '}
              <strong className="text-text-primary">
                {projectInfo.projectName || 'the project'}
              </strong>{' '}
              located in{' '}
              {projectInfo.city || projectInfo.location || 'the specified location'}
              , {projectInfo.country || ''}.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="p-3 rounded-lg bg-solar-sky/10 text-center">
                <div className="text-xl font-bold text-solar-sky">
                  {fmt(pvDesign.requiredPVPower / 1000)} kW
                </div>
                <div className="text-xs text-text-muted mt-1">System Capacity</div>
              </div>
              <div className="p-3 rounded-lg bg-solar-sun/10 text-center">
                <div className="text-xl font-bold text-solar-sun">
                  {pvDesign.numberOfPanels}
                </div>
                <div className="text-xs text-text-muted mt-1">Number of Panels</div>
              </div>
              <div className="p-3 rounded-lg bg-solar-green/10 text-center">
                <div className="text-xl font-bold text-solar-green">
                  {fmt(financialAnalysis.annualEnergy)} kWh
                </div>
                <div className="text-xs text-text-muted mt-1">Annual Energy Production</div>
              </div>
              <div className="p-3 rounded-lg bg-solar-purple/10 text-center">
                <div className="text-xl font-bold text-solar-purple">
                  {fmt(financialAnalysis.co2Reduction)} t/yr
                </div>
                <div className="text-xs text-text-muted mt-1">CO2 Reduction</div>
              </div>
            </div>
            <p className="mt-3">
              The system is designed to produce an estimated{' '}
              <strong className="text-text-primary">
                {fmt(financialAnalysis.annualEnergy)} kWh
              </strong>{' '}
              annually, reducing CO2 emissions by approximately{' '}
              <strong className="text-text-primary">
                {fmt(financialAnalysis.co2Reduction)} tons/year
              </strong>
              {' '}over the {financialAnalysis.systemLifetime}-year system lifetime, contributing significantly to clean energy generation and environmental sustainability.
            </p>
          </div>
        ),
      },
      {
        id: 'project',
        title: t('report.systemOverview'),
        icon: <Info className="w-4 h-4" />,
        content: (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {(
              [
                ['Project Name', projectInfo.projectName],
                ['Application', projectInfo.application],
                ['Location', projectInfo.city + ', ' + projectInfo.country],
                ['Latitude', fmt(projectInfo.latitude, 4)],
                ['Longitude', fmt(projectInfo.longitude, 4)],
                ['Grid Voltage', projectInfo.gridVoltage + ' V'],
                ['Frequency', projectInfo.frequency + ' Hz'],
                ['Phase Type', projectInfo.phaseType === 'three' ? 'Three Phase' : 'Single Phase'],
              ] as [string, string][]
            ).map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between p-2.5 rounded-lg bg-surface-alt/50 border border-border/50"
              >
                <span className="text-text-secondary">{label}</span>
                <span className="font-medium text-text-primary">{value || '-'}</span>
              </div>
            ))}
          </div>
        ),
      },
      {
        id: 'site',
        title: 'Site Information',
        icon: <Sun className="w-4 h-4" />,
        content: (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(
                [
                  ['Peak Sun Hours', fmt(solarResource.peakSunHours) + ' hrs'],
                  ['Avg Irradiance', fmt(solarResource.averageIrradiance) + ' kWh/m2/day'],
                  ['Altitude', solarResource.altitude + ' m'],
                  ['Ambient Temp (Avg)', fmt(solarResource.ambientTemperature.reduce((a, b) => a + b, 0) / 12) + ' C'],
                  ['Panel Temp (Est.)', fmt(solarResource.panelTemperature) + ' C'],
                ] as [string, string][]
              ).map(([label, value]) => (
                <div key={label} className="p-2.5 rounded-lg bg-surface-alt/50 border border-border/50">
                  <div className="text-text-secondary text-xs">{label}</div>
                  <div className="font-semibold text-text-primary mt-1">{value}</div>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <h4 className="font-semibold text-text-primary mb-2">System Losses Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(
                  [
                    ['Shading', solarResource.losses.shading],
                    ['Dust', solarResource.losses.dust],
                    ['Cable', solarResource.losses.cableLoss],
                    ['Mismatch', solarResource.losses.mismatchLoss],
                    ['Soiling', solarResource.losses.soiling],
                    ['Temperature', solarResource.losses.temperatureLoss],
                    ['System', solarResource.losses.systemLoss],
                  ] as [string, number][]
                ).map(([name, val]) => (
                  <div key={name} className="flex justify-between p-2 rounded bg-surface-alt/30 text-xs">
                    <span className="text-text-muted">{name}</span>
                    <span className="font-medium text-text-primary">{val}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'load',
        title: 'Load Analysis',
        icon: <BarChart3 className="w-4 h-4" />,
        content: (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(
                [
                  ['Daily Energy', fmt(loadProfile.dailyEnergy) + ' kWh'],
                  ['Peak Demand', fmt(loadProfile.peakDemand) + ' kW'],
                  ['Avg Demand', fmt(loadProfile.averageDemand) + ' kW'],
                  ['Night Energy', fmt(loadProfile.nightEnergy) + ' kWh'],
                ] as [string, string][]
              ).map(([label, value]) => (
                <div key={label} className="p-3 rounded-lg bg-solar-sky/5 border border-solar-sky/20 text-center">
                  <div className="text-lg font-bold text-solar-sky">{value}</div>
                  <div className="text-xs text-text-muted mt-1">{label}</div>
                </div>
              ))}
            </div>
            {loadProfile.loads.length > 0 && (
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-2 py-1.5 text-left text-text-secondary font-semibold">Load Name</th>
                      <th className="px-2 py-1.5 text-right text-text-secondary font-semibold">Power (W)</th>
                      <th className="px-2 py-1.5 text-right text-text-secondary font-semibold">Qty</th>
                      <th className="px-2 py-1.5 text-right text-text-secondary font-semibold">Hours</th>
                      <th className="px-2 py-1.5 text-right text-text-secondary font-semibold">Schedule</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadProfile.loads.map((load) => (
                      <tr key={load.id} className="border-b border-border/30">
                        <td className="px-2 py-1.5 text-text-primary">{load.name}</td>
                        <td className="px-2 py-1.5 text-right">{load.power}</td>
                        <td className="px-2 py-1.5 text-right">{load.quantity}</td>
                        <td className="px-2 py-1.5 text-right">{load.workingHours}</td>
                        <td className="px-2 py-1.5 text-right capitalize">{load.scheduleType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'energy',
        title: 'Energy Analysis',
        icon: <Zap className="w-4 h-4" />,
        content: (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(
                [
                  ['Annual Production', fmt(financialAnalysis.annualEnergy) + ' kWh'],
                  ['Specific Yield', fmt(pvDesign.requiredPVPower > 0 ? (financialAnalysis.annualEnergy / (pvDesign.requiredPVPower / 1000)) : 0) + ' kWh/kWp'],
                  ['Performance Ratio', fmt(100 - Object.values(solarResource.losses).reduce((a, b) => a + b, 0)) + '%'],
                ] as [string, string][]
              ).map(([label, value]) => (
                <div key={label} className="p-2.5 rounded-lg bg-surface-alt/50 border border-border/50">
                  <div className="text-text-secondary text-xs">{label}</div>
                  <div className="font-semibold text-text-primary mt-1">{value}</div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'solarResource',
        title: 'Solar Resource Assessment',
        icon: <Sun className="w-4 h-4" />,
        content: (
          <div className="space-y-3 text-sm">
            <h4 className="font-semibold text-text-primary">Monthly Irradiance Profile</h4>
            <div className="grid grid-cols-6 md:grid-cols-12 gap-1.5">
              {solarResource.monthlyIrradiance.map((val, idx) => {
                const max = Math.max(...solarResource.monthlyIrradiance);
                const pct = max > 0 ? (val / max) * 100 : 0;
                return (
                  <div key={idx} className="text-center">
                    <div className="relative h-20 w-full bg-surface-alt rounded-t overflow-hidden">
                      <div
                        className="absolute bottom-0 w-full bg-gradient-to-t from-solar-sun to-solar-gold rounded-t transition-all"
                        style={{ height: pct + '%' }}
                      />
                    </div>
                    <div className="text-[10px] text-text-muted mt-1">
                      {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][idx]}
                    </div>
                    <div className="text-[10px] font-medium text-text-primary">{fmt(val)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ),
      },
      {
        id: 'pvArray',
        title: 'PV Array Design',
        icon: <Sun className="w-4 h-4" />,
        content: (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(
                [
                  ['Required PV Power', fmt(pvDesign.requiredPVPower) + ' kW'],
                  ['Number of Panels', String(pvDesign.numberOfPanels)],
                  ['Series per String', String(pvDesign.seriesPanels)],
                  ['Parallel Strings', String(pvDesign.parallelStrings)],
                  ['String Voltage (Vmp)', fmt(pvDesign.stringVoltage) + ' V'],
                  ['Max String Voltage (Voc)', fmt(pvDesign.maxStringVoltage) + ' V'],
                  ['Safety Factor', pvDesign.safetyMargin + 'x'],
                  ['MPPT Validation', pvDesign.mpptValidation ? 'PASS' : 'FAIL'],
                ] as [string, string][]
              ).map(([label, value]) => (
                <div key={label} className="p-2.5 rounded-lg bg-surface-alt/50 border border-border/50">
                  <div className="text-text-secondary text-xs">{label}</div>
                  <div className={'font-semibold mt-1 ' + (label.includes('MPPT Validation')
                    ? (pvDesign.mpptValidation ? 'text-solar-green' : 'text-solar-red')
                    : 'text-text-primary')}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
            {pvDesign.selectedPanel && (
              <div className="p-3 rounded-lg bg-solar-sun/5 border border-solar-sun/20">
                <h4 className="font-semibold text-text-primary mb-2">
                  Selected Panel: {pvDesign.selectedPanel.manufacturer} {pvDesign.selectedPanel.model}
                </h4>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                  {(
                    [
                      ['Power', pvDesign.selectedPanel.power + ' W'],
                      ['Voc', pvDesign.selectedPanel.voc + ' V'],
                      ['Vmp', pvDesign.selectedPanel.vmp + ' V'],
                      ['Isc', pvDesign.selectedPanel.isc + ' A'],
                      ['Imp', pvDesign.selectedPanel.imp + ' A'],
                      ['Efficiency', pvDesign.selectedPanel.efficiency + '%'],
                    ] as [string, string][]
                  ).map(([l, v]) => (
                    <div key={l}>
                      <span className="text-text-muted">{l}: </span>
                      <span className="font-medium text-text-primary">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'battery',
        title: 'Battery Bank Design',
        icon: <Battery className="w-4 h-4" />,
        content: (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(
                [
                  ['Battery Voltage', batteryDesign.batteryVoltage + ' V'],
                  ['Capacity', fmt(batteryDesign.batteryCapacity) + ' Ah'],
                  ['Total Energy', fmt(batteryDesign.totalKwh) + ' kWh'],
                  ['Total Batteries', String(batteryDesign.totalBatteries)],
                  ['Series Count', String(batteryDesign.seriesCount)],
                  ['Parallel Strings', String(batteryDesign.parallelCount)],
                  ['DoD', (batteryDesign.dod * 100) + '%'],
                  ['Backup Time', fmt(batteryDesign.backupTime) + ' hrs'],
                ] as [string, string][]
              ).map(([label, value]) => (
                <div key={label} className="p-2.5 rounded-lg bg-solar-green/5 border border-solar-green/20">
                  <div className="text-text-secondary text-xs">{label}</div>
                  <div className="font-semibold text-solar-green mt-1">{value}</div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'inverter',
        title: 'Inverter Selection',
        icon: <Zap className="w-4 h-4" />,
        content: (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(
                [
                  ['System Type', inverterDesign.systemType.toUpperCase()],
                  ['Rated Power', fmt(inverterDesign.ratedPower) + ' kW'],
                  ['DC/AC Ratio', fmt(pvDesign.requiredPVPower / (inverterDesign.ratedPower * 1000 || 1), 2) + 'x'],
                  ['MPPT Count', String(inverterDesign.numberOfMppt)],
                  ['Max PV Input', fmt(inverterDesign.maxPvInput) + ' kW'],
                  ['Grid Voltage', inverterDesign.gridVoltage + ' V'],
                  ['Safety Factor', inverterDesign.safetyFactor + 'x'],
                ] as [string, string][]
              ).map(([label, value]) => (
                <div key={label} className="p-2.5 rounded-lg bg-solar-purple/5 border border-solar-purple/20">
                  <div className="text-text-secondary text-xs">{label}</div>
                  <div className="font-semibold text-solar-purple mt-1">{value}</div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        id: 'cable',
        title: 'Cable Sizing',
        icon: <Cable className="w-4 h-4" />,
        content: (
          <div className="space-y-3 text-sm">
            {[
              { label: 'DC Cable (PV to Inverter)', spec: cableSizing.dcCable },
              { label: 'AC Cable (Inverter to Grid)', spec: cableSizing.acCable },
              { label: 'Battery Cable', spec: cableSizing.batteryCable },
              { label: 'Grounding Cable', spec: cableSizing.groundCable },
            ].map(({ label, spec }) => (
              <div key={label} className="p-3 rounded-lg bg-surface-alt/50 border border-border/50">
                <h4 className="font-semibold text-text-primary mb-2">{label}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div><span className="text-text-muted">Size: </span><span className="font-medium">{spec.recommendedSize} mm2</span></div>
                  <div><span className="text-text-muted">Current: </span><span className="font-medium">{fmt(spec.current)} A</span></div>
                  <div><span className="text-text-muted">Voltage Drop: </span><span className="font-medium">{fmt(spec.voltageDropPercent, 2)}%</span></div>
                  <div><span className="text-text-muted">Type: </span><span className="font-medium">{spec.cableType}</span></div>
                </div>
              </div>
            ))}
          </div>
        ),
      },
      {
        id: 'protection',
        title: 'Protection Devices',
        icon: <Shield className="w-4 h-4" />,
        content: (
          <div className="space-y-3 text-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-2 py-1.5 text-left text-text-secondary font-semibold">Device</th>
                    <th className="px-2 py-1.5 text-right text-text-secondary font-semibold">Rating</th>
                    <th className="px-2 py-1.5 text-right text-text-secondary font-semibold">Breaking Cap.</th>
                    <th className="px-2 py-1.5 text-center text-text-secondary font-semibold">Poles</th>
                    <th className="px-2 py-1.5 text-left text-text-secondary font-semibold">Standard</th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      ['MCB (DC)', protectionDevices.mcb],
                      ['MCCB (AC)', protectionDevices.mccb],
                      ['Fuse', protectionDevices.fuse],
                      ['SPD', protectionDevices.spd],
                      ['DC Isolator', protectionDevices.dcIsolator],
                      ['AC Isolator', protectionDevices.acIsolator],
                      ['RCBO', protectionDevices.rcbo],
                      ['RCD', protectionDevices.rcd],
                    ] as [string, typeof protectionDevices.mcb][]
                  ).map(([name, dev]) => (
                    <tr key={name} className="border-b border-border/30">
                      <td className="px-2 py-1.5 font-medium text-text-primary">{name}</td>
                      <td className="px-2 py-1.5 text-right">{dev.rating} A</td>
                      <td className="px-2 py-1.5 text-right">{dev.breakingCapacity.toLocaleString()} A</td>
                      <td className="px-2 py-1.5 text-center">{dev.poles}</td>
                      <td className="px-2 py-1.5 text-text-muted">{dev.standard}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ),
      },
      {
        id: 'sld',
        title: 'Single Line Diagram',
        icon: <LayoutList className="w-4 h-4" />,
        content: (
          <div className="p-4 rounded-xl bg-surface-alt border border-border overflow-x-auto">
            <div className="flex flex-col items-center gap-0 min-w-[320px] max-w-md mx-auto">
              {/* PV Array */}
              <div className="w-full max-w-[240px] rounded-xl border-2 border-amber-400 bg-gradient-to-b from-amber-50 to-amber-100 p-3 text-center">
                <div className="grid grid-cols-5 gap-px mb-2">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className="h-4 bg-amber-300/60 border border-amber-400/40 rounded-sm" />
                  ))}
                </div>
                <div className="text-xs font-bold text-amber-800">SOLAR PV ARRAY</div>
                <div className="text-[10px] text-amber-700">{fmt(pvDesign.requiredPVPower/1000)} kWp | {pvDesign.numberOfPanels} panels</div>
                <div className="text-[10px] text-amber-600">{pvDesign.seriesPanels}S x {pvDesign.parallelStrings}P</div>
              </div>
              {/* Line */}
              <div className="w-px h-4 bg-gray-400" />
              <div className="text-amber-500 text-lg leading-none">▼</div>
              {/* DC MCB */}
              <div className="px-4 py-1 rounded bg-blue-50 border border-blue-300 text-[10px] text-blue-800 font-medium">DC MCB {protectionDevices.mcb.rating}A</div>
              <div className="w-px h-3 bg-gray-400" />
              {/* SPD */}
              <div className="px-4 py-1 rounded bg-red-50 border border-red-300 text-[10px] text-red-800 font-medium">SPD {protectionDevices.spd.rating}V</div>
              <div className="w-px h-3 bg-gray-400" />
              {/* DC Isolator */}
              <div className="px-4 py-1 rounded bg-green-50 border border-green-300 text-[10px] text-green-800 font-medium">DC Isolator {protectionDevices.dcIsolator.rating}A</div>
              <div className="w-px h-4 bg-gray-400" />
              <div className="text-purple-500 text-lg leading-none">▼</div>
              {/* Inverter + Battery Row */}
              <div className="flex items-center gap-3 w-full max-w-[360px] justify-center">
                {/* Inverter */}
                <div className="flex-1 max-w-[200px] rounded-xl border-2 border-purple-400 bg-gradient-to-b from-purple-50 to-purple-100 p-3 text-center">
                  <div className="text-xs font-bold text-purple-800">INVERTER</div>
                  <div className="text-[10px] text-purple-700">{fmt(inverterDesign.ratedPower)} kW {inverterDesign.systemType.toUpperCase()}</div>
                  <div className="text-[10px] text-purple-600">{inverterDesign.numberOfMppt}x MPPT</div>
                </div>
                {/* Battery Branch */}
                <div className="flex flex-col items-center gap-0">
                  <div className="w-8 h-px bg-gray-400" />
                  <div className="w-px h-2 bg-gray-400" />
                  <div className="px-3 py-1 rounded bg-green-50 border border-green-300 text-[10px] text-green-800 font-medium text-center">
                    BATTERY<br/>{batteryDesign.batteryVoltage}V {fmt(batteryDesign.batteryCapacity)}Ah<br/>{batteryDesign.totalBatteries} units
                  </div>
                </div>
              </div>
              {/* Line */}
              <div className="w-px h-4 bg-gray-400" />
              <div className="text-purple-500 text-lg leading-none">▼</div>
              {/* AC MCB */}
              <div className="px-4 py-1 rounded bg-blue-50 border border-blue-300 text-[10px] text-blue-800 font-medium">AC MCB {protectionDevices.mccb.rating}A</div>
              <div className="w-px h-3 bg-gray-400" />
              {/* RCBO */}
              <div className="px-4 py-1 rounded bg-orange-50 border border-orange-300 text-[10px] text-orange-800 font-medium">RCBO {protectionDevices.rcbo.rating}A / 30mA</div>
              <div className="w-px h-4 bg-gray-400" />
              {/* Busbar split */}
              <div className="w-40 h-px bg-gray-400" />
              {/* Grid + Loads */}
              <div className="flex gap-8 w-full max-w-[300px] justify-center">
                <div className="flex flex-col items-center gap-0">
                  <div className="w-px h-3 bg-gray-400" />
                  <div className="text-red-500 text-lg leading-none">▼</div>
                  <div className="px-4 py-2 rounded-lg bg-red-50 border-2 border-red-300 text-center">
                    <div className="text-[10px] font-bold text-red-800">UTILITY GRID</div>
                    <div className="text-[10px] text-red-600">{projectInfo.gridVoltage}V {projectInfo.frequency}Hz</div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-0">
                  <div className="w-px h-3 bg-gray-400" />
                  <div className="text-cyan-500 text-lg leading-none">▼</div>
                  <div className="px-4 py-2 rounded-lg bg-cyan-50 border-2 border-cyan-300 text-center">
                    <div className="text-[10px] font-bold text-cyan-800">LOADS</div>
                    <div className="text-[10px] text-cyan-600">{fmt(loadProfile.peakDemand)} kW</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'notes',
        title: 'Engineering Notes',
        icon: <BookOpen className="w-4 h-4" />,
        content: (
          <ol className="space-y-2 text-sm text-text-secondary list-decimal list-inside">
            <li>All cable sizing complies with NEC Table 310 and IEC 60364-5-52.</li>
            <li>Voltage drop is limited to 3% on DC side and 3% on AC side per NEC.</li>
            <li>Temperature correction factors applied based on ambient conditions.</li>
            <li>MPPT voltage range validation ensures optimal power point tracking.</li>
            <li>DC/AC ratio maintained between 1.0 and 1.3 for optimal energy harvest.</li>
            <li>Battery bank sized for {batteryDesign.backupTime} hours backup with {batteryDesign.dod * 100}% DoD.</li>
            <li>Protection devices selected per IEC and NEC standards.</li>
            <li>Grounding system per IEC 60364-5-54 with earth resistance below 1 ohm.</li>
            <li>SPD Type II installed on both DC and AC sides.</li>
            <li>System monitoring via inverter communication is recommended.</li>
          </ol>
        ),
      },
      {
        id: 'warnings',
        title: 'Warnings & Precautions',
        icon: <AlertTriangle className="w-4 h-4" />,
        content: (
          <div className="space-y-2 text-sm">
            {!pvDesign.mpptValidation && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-solar-red/10 border border-solar-red/20">
                <AlertTriangle className="w-4 h-4 text-solar-red mt-0.5 shrink-0" />
                <span className="text-solar-red">MPPT voltage validation failed. String configuration needs review.</span>
              </div>
            )}
            {cableSizing.dcCable.voltageDropPercent > 3 && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-solar-red/10 border border-solar-red/20">
                <AlertTriangle className="w-4 h-4 text-solar-red mt-0.5 shrink-0" />
                <span className="text-solar-red">DC cable voltage drop ({fmt(cableSizing.dcCable.voltageDropPercent, 2)}%) exceeds 3% limit.</span>
              </div>
            )}
            {cableSizing.acCable.voltageDropPercent > 3 && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-solar-red/10 border border-solar-red/20">
                <AlertTriangle className="w-4 h-4 text-solar-red mt-0.5 shrink-0" />
                <span className="text-solar-red">AC cable voltage drop ({fmt(cableSizing.acCable.voltageDropPercent, 2)}%) exceeds 3% limit.</span>
              </div>
            )}
            {pvDesign.mpptValidation && cableSizing.dcCable.voltageDropPercent <= 3 && cableSizing.acCable.voltageDropPercent <= 3 && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-solar-green/10 border border-solar-green/20">
                <CheckCircle2 className="w-4 h-4 text-solar-green mt-0.5 shrink-0" />
                <span className="text-solar-green">All validations passed. System design meets engineering standards.</span>
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'recommendations',
        title: 'Recommendations',
        icon: <CheckCircle2 className="w-4 h-4" />,
        content: (
          <ul className="space-y-2 text-sm text-text-secondary list-disc list-inside">
            <li>Schedule panel cleaning every 3 months for optimal irradiance absorption.</li>
            <li>Install monitoring to track actual vs. predicted performance.</li>
            <li>Plan battery replacement after manufacturer warranty limit.</li>
            <li>Annual thermal imaging inspection of electrical connections.</li>
            <li>Ensure proper ventilation around inverter and battery enclosures.</li>
            <li>Maintain 1m clearance around equipment for maintenance access.</li>
            <li>Document all as-built drawings and maintain updated SLD.</li>
          </ul>
        ),
      },
      {
        id: 'standards',
        title: 'Standards Used',
        icon: <BookOpen className="w-4 h-4" />,
        content: (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {[
              'NEC Article 690 - Solar Photovoltaic Systems',
              'IEC 61215 - Design Qualification for PV Modules',
              'IEC 61730 - PV Module Safety Qualification',
              'IEC 62446 - Grid Connected PV Systems',
              'IEC 60364 - Electrical Installations',
              'IEC 60898-1 - MCB Standard',
              'IEC 60947-2 - MCCB Standard',
              'IEC 60269 - Fuse Standard',
              'IEC 61643-11 - SPD Standard',
              'IEC 60947-3 - Isolator Standard',
              'IEC 61009-1 - RCBO Standard',
              'IEC 60364-5-54 - Earthing Standard',
              'IEC 62305 - Lightning Protection',
              'IEEE 1547 - Interconnecting DER with Grid',
              'UL 1741 - Inverters for Distributed Generation',
            ].map((std) => (
              <div key={std} className="flex items-center gap-2 p-2 rounded-lg bg-surface-alt/50 border border-border/50">
                <CheckCircle2 className="w-3 h-3 text-solar-green shrink-0" />
                <span className="text-xs">{std}</span>
              </div>
            ))}
          </div>
        ),
      },
      {
        id: 'appendix',
        title: 'Appendix',
        icon: <FileText className="w-4 h-4" />,
        content: (
          <div className="space-y-4 text-sm text-text-secondary">
            <div>
              <h4 className="font-semibold text-text-primary mb-2">Bill of Materials Summary</h4>
              <div className="text-xs">
                Total components: {bomItems.length}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-2">Document Information</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <div>Revision: 1.0</div>
                <div>Project: {projectInfo.projectName || 'Untitled'}</div>
                <div>Application: {projectInfo.application}</div>
              </div>
            </div>
          </div>
        ),
      },
    ];
  }

  const sections = getSections();

  const generatePDF = useCallback(async () => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Solar PV System - Engineering Report', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Solar PV Engineering Co. | Eng. Sameer Qatina', 105, 28, { align: 'center' });
    doc.text(
      'Project: ' + (projectInfo.projectName || 'Untitled') + ' | Date: ' + new Date().toLocaleDateString(),
      105, 34, { align: 'center' }
    );

    let y = 44;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 14;
    const colWidth = (210 - 2 * margin) / 2;

    function checkPage(needed: number) {
      if (y + needed > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
    }

    // --- Executive Summary ---
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'This report presents the complete design of a ' + projectInfo.application + ' solar PV system for ' +
      (projectInfo.projectName || 'the project') + ' located in ' +
      (projectInfo.city || projectInfo.location || 'N/A') + ', ' + (projectInfo.country || '') + '.',
      margin, y, { maxWidth: 210 - 2 * margin }
    );
    y += 10;
    autoTable(doc, {
      startY: y,
      head: [['Parameter', 'Value']],
      body: [
        ['System Capacity', fmt(pvDesign.requiredPVPower / 1000) + ' kW'],
        ['Number of Panels', String(pvDesign.numberOfPanels)],
        ['Annual Energy Production', fmt(financialAnalysis.annualEnergy) + ' kWh'],
        ['CO2 Reduction', fmt(financialAnalysis.co2Reduction) + ' tons/year'],
        ['System Lifetime', String(financialAnalysis.systemLifetime) + ' years'],
      ],
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      margin: { left: margin, right: margin },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    // --- Project Info ---
    checkPage(60);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Project Information', margin, y);
    y += 8;
    autoTable(doc, {
      startY: y,
      head: [['Parameter', 'Value']],
      body: [
        ['Project Name', projectInfo.projectName || '-'],
        ['Application', projectInfo.application],
        ['Location', (projectInfo.city || '') + ', ' + (projectInfo.country || '')],
        ['Latitude', fmt(projectInfo.latitude, 4)],
        ['Longitude', fmt(projectInfo.longitude, 4)],
        ['Grid Voltage', projectInfo.gridVoltage + ' V'],
        ['Frequency', projectInfo.frequency + ' Hz'],
        ['Phase Type', projectInfo.phaseType === 'three' ? 'Three Phase' : 'Single Phase'],
      ],
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      margin: { left: margin, right: margin },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    // --- Site Information ---
    checkPage(60);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Site Information', margin, y);
    y += 8;
    autoTable(doc, {
      startY: y,
      head: [['Parameter', 'Value']],
      body: [
        ['Peak Sun Hours', fmt(solarResource.peakSunHours) + ' hrs'],
        ['Avg Irradiance', fmt(solarResource.averageIrradiance) + ' kWh/m2/day'],
        ['Altitude', solarResource.altitude + ' m'],
        ['Ambient Temp (Avg)', fmt(solarResource.ambientTemperature.reduce((a, b) => a + b, 0) / 12) + ' C'],
        ['Panel Temp (Est.)', fmt(solarResource.panelTemperature) + ' C'],
      ],
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      margin: { left: margin, right: margin },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    // System Losses
    checkPage(40);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('System Losses Breakdown', margin, y);
    y += 6;
    const lossEntries = Object.entries(solarResource.losses) as [string, number][];
    autoTable(doc, {
      startY: y,
      head: [['Loss Type', 'Value (%)']],
      body: lossEntries.map(([k, v]) => [k, v + '%']),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      margin: { left: margin, right: margin },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    // --- Load Analysis ---
    checkPage(60);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Load Analysis', margin, y);
    y += 8;
    autoTable(doc, {
      startY: y,
      head: [['Parameter', 'Value']],
      body: [
        ['Daily Energy', fmt(loadProfile.dailyEnergy) + ' kWh'],
        ['Peak Demand', fmt(loadProfile.peakDemand) + ' kW'],
        ['Average Demand', fmt(loadProfile.averageDemand) + ' kW'],
        ['Night Energy', fmt(loadProfile.nightEnergy) + ' kWh'],
      ],
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      margin: { left: margin, right: margin },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

    if (loadProfile.loads.length > 0) {
      checkPage(40);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Load Details', margin, y);
      y += 6;
      autoTable(doc, {
        startY: y,
        head: [['Load Name', 'Power (W)', 'Qty', 'Hours', 'Schedule']],
        body: loadProfile.loads.map((l) => [l.name, String(l.power), String(l.quantity), String(l.workingHours), l.scheduleType]),
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [241, 245, 249] },
        margin: { left: margin, right: margin },
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    }

    // --- Energy Analysis ---
    checkPage(50);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Energy Analysis', margin, y);
    y += 8;
    autoTable(doc, {
      startY: y,
      head: [['Parameter', 'Value']],
      body: [
        ['Annual Production', fmt(financialAnalysis.annualEnergy) + ' kWh'],
        ['Specific Yield', fmt(pvDesign.requiredPVPower > 0 ? (financialAnalysis.annualEnergy / (pvDesign.requiredPVPower / 1000)) : 0) + ' kWh/kWp'],
        ['Performance Ratio', fmt(100 - Object.values(solarResource.losses).reduce((a, b) => a + b, 0)) + '%'],
      ],
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      margin: { left: margin, right: margin },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    // --- PV Array Design ---
    checkPage(60);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PV Array Design', margin, y);
    y += 8;
    const pvBody: string[][] = [
      ['Required PV Power', fmt(pvDesign.requiredPVPower) + ' W'],
      ['Number of Panels', String(pvDesign.numberOfPanels)],
      ['Series per String', String(pvDesign.seriesPanels)],
      ['Parallel Strings', String(pvDesign.parallelStrings)],
      ['String Voltage (Vmp)', fmt(pvDesign.stringVoltage) + ' V'],
      ['Max String Voltage (Voc)', fmt(pvDesign.maxStringVoltage) + ' V'],
      ['Safety Factor', pvDesign.safetyMargin + 'x'],
      ['MPPT Validation', pvDesign.mpptValidation ? 'PASS' : 'FAIL'],
    ];
    if (pvDesign.selectedPanel) {
      pvBody.push(['Selected Panel', pvDesign.selectedPanel.manufacturer + ' ' + pvDesign.selectedPanel.model]);
      pvBody.push(['Panel Power', pvDesign.selectedPanel.power + ' W']);
      pvBody.push(['Panel Voc', pvDesign.selectedPanel.voc + ' V']);
      pvBody.push(['Panel Vmp', pvDesign.selectedPanel.vmp + ' V']);
      pvBody.push(['Panel Isc', pvDesign.selectedPanel.isc + ' A']);
      pvBody.push(['Panel Imp', pvDesign.selectedPanel.imp + ' A']);
      pvBody.push(['Panel Efficiency', pvDesign.selectedPanel.efficiency + '%']);
    }
    autoTable(doc, {
      startY: y,
      head: [['Parameter', 'Value']],
      body: pvBody,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      margin: { left: margin, right: margin },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    // --- Battery Design ---
    checkPage(60);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Battery Bank Design', margin, y);
    y += 8;
    autoTable(doc, {
      startY: y,
      head: [['Parameter', 'Value']],
      body: [
        ['Battery Voltage', batteryDesign.batteryVoltage + ' V'],
        ['Capacity', fmt(batteryDesign.batteryCapacity) + ' Ah'],
        ['Total Energy', fmt(batteryDesign.totalKwh) + ' kWh'],
        ['Total Batteries', String(batteryDesign.totalBatteries)],
        ['Series Count', String(batteryDesign.seriesCount)],
        ['Parallel Strings', String(batteryDesign.parallelCount)],
        ['Depth of Discharge', (batteryDesign.dod * 100) + '%'],
        ['Backup Time', fmt(batteryDesign.backupTime) + ' hrs'],
      ],
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      margin: { left: margin, right: margin },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    // --- Inverter Selection ---
    checkPage(60);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Inverter Selection', margin, y);
    y += 8;
    autoTable(doc, {
      startY: y,
      head: [['Parameter', 'Value']],
      body: [
        ['System Type', inverterDesign.systemType.toUpperCase()],
        ['Rated Power', fmt(inverterDesign.ratedPower) + ' kW'],
        ['DC/AC Ratio', fmt(pvDesign.requiredPVPower / (inverterDesign.ratedPower * 1000 || 1), 2) + 'x'],
        ['MPPT Count', String(inverterDesign.numberOfMppt)],
        ['Max PV Input', fmt(inverterDesign.maxPvInput) + ' kW'],
        ['Grid Voltage', inverterDesign.gridVoltage + ' V'],
        ['Safety Factor', inverterDesign.safetyFactor + 'x'],
      ],
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      margin: { left: margin, right: margin },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    // --- Cable Sizing ---
    checkPage(60);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Cable Sizing', margin, y);
    y += 8;
    const cableData = [
      { label: 'DC Cable (PV to Inverter)', spec: cableSizing.dcCable },
      { label: 'AC Cable (Inverter to Grid)', spec: cableSizing.acCable },
      { label: 'Battery Cable', spec: cableSizing.batteryCable },
      { label: 'Grounding Cable', spec: cableSizing.groundCable },
    ];
    autoTable(doc, {
      startY: y,
      head: [['Cable', 'Size (mm2)', 'Current (A)', 'V Drop (%)', 'Type']],
      body: cableData.map((c) => [c.label, c.spec.recommendedSize + ' mm2', fmt(c.spec.current), fmt(c.spec.voltageDropPercent, 2) + '%', c.spec.cableType]),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      margin: { left: margin, right: margin },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    // --- Protection Devices ---
    checkPage(60);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Protection Devices', margin, y);
    y += 8;
    const protDevices: [string, typeof protectionDevices.mcb][] = [
      ['MCB (DC)', protectionDevices.mcb],
      ['MCCB (AC)', protectionDevices.mccb],
      ['Fuse', protectionDevices.fuse],
      ['SPD', protectionDevices.spd],
      ['DC Isolator', protectionDevices.dcIsolator],
      ['AC Isolator', protectionDevices.acIsolator],
      ['RCBO', protectionDevices.rcbo],
      ['RCD', protectionDevices.rcd],
    ];
    autoTable(doc, {
      startY: y,
      head: [['Device', 'Rating (A)', 'Breaking Cap. (A)', 'Poles', 'Standard']],
      body: protDevices.map(([name, dev]) => [name, String(dev.rating), dev.breakingCapacity.toLocaleString(), String(dev.poles), dev.standard]),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      margin: { left: margin, right: margin },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    // --- Engineering Notes ---
    checkPage(50);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Engineering Notes', margin, y);
    y += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const notes = [
      '1. All cable sizing complies with NEC Table 310 and IEC 60364-5-52.',
      '2. Voltage drop is limited to 3% on DC side and 3% on AC side per NEC.',
      '3. Temperature correction factors applied based on ambient conditions.',
      '4. MPPT voltage range validation ensures optimal power point tracking.',
      '5. DC/AC ratio maintained between 1.0 and 1.3 for optimal energy harvest.',
      '6. Battery bank sized for ' + batteryDesign.backupTime + ' hours backup with ' + (batteryDesign.dod * 100) + '% DoD.',
      '7. Protection devices selected per IEC and NEC standards.',
      '8. Grounding system per IEC 60364-5-54 with earth resistance below 1 ohm.',
      '9. SPD Type II installed on both DC and AC sides.',
      '10. System monitoring via inverter communication is recommended.',
    ];
    notes.forEach((note) => {
      checkPage(5);
      doc.text(note, margin, y);
      y += 5;
    });
    y += 6;

    // --- Warnings ---
    checkPage(30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Warnings & Precautions', margin, y);
    y += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    if (!pvDesign.mpptValidation) {
      doc.setTextColor(200, 0, 0);
      doc.text('- MPPT voltage validation failed. String configuration needs review.', margin, y);
      y += 5;
      doc.setTextColor(0);
    }
    if (cableSizing.dcCable.voltageDropPercent > 3) {
      doc.setTextColor(200, 0, 0);
      doc.text('- DC cable voltage drop (' + fmt(cableSizing.dcCable.voltageDropPercent, 2) + '%) exceeds 3% limit.', margin, y);
      y += 5;
      doc.setTextColor(0);
    }
    if (cableSizing.acCable.voltageDropPercent > 3) {
      doc.setTextColor(200, 0, 0);
      doc.text('- AC cable voltage drop (' + fmt(cableSizing.acCable.voltageDropPercent, 2) + '%) exceeds 3% limit.', margin, y);
      y += 5;
      doc.setTextColor(0);
    }
    if (pvDesign.mpptValidation && cableSizing.dcCable.voltageDropPercent <= 3 && cableSizing.acCable.voltageDropPercent <= 3) {
      doc.setTextColor(0, 128, 0);
      doc.text('- All validations passed. System design meets engineering standards.', margin, y);
      y += 5;
      doc.setTextColor(0);
    }
    y += 6;

    // --- Recommendations ---
    checkPage(40);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Recommendations', margin, y);
    y += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const recs = [
      '1. Schedule panel cleaning every 3 months for optimal irradiance absorption.',
      '2. Install monitoring to track actual vs. predicted performance.',
      '3. Plan battery replacement after manufacturer warranty limit.',
      '4. Annual thermal imaging inspection of electrical connections.',
      '5. Ensure proper ventilation around inverter and battery enclosures.',
      '6. Maintain 1m clearance around equipment for maintenance access.',
      '7. Document all as-built drawings and maintain updated SLD.',
    ];
    recs.forEach((r) => {
      checkPage(5);
      doc.text(r, margin, y);
      y += 5;
    });
    y += 6;

    // --- Standards ---
    checkPage(50);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Standards Used', margin, y);
    y += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const standards = [
      'NEC Article 690 - Solar Photovoltaic Systems',
      'IEC 61215 - Design Qualification for PV Modules',
      'IEC 61730 - PV Module Safety Qualification',
      'IEC 62446 - Grid Connected PV Systems',
      'IEC 60364 - Electrical Installations',
      'IEC 60898-1 - MCB Standard',
      'IEC 60947-2 - MCCB Standard',
      'IEC 60269 - Fuse Standard',
      'IEC 61643-11 - SPD Standard',
      'IEC 60947-3 - Isolator Standard',
      'IEC 61009-1 - RCBO Standard',
      'IEC 60364-5-54 - Earthing Standard',
      'IEC 62305 - Lightning Protection',
      'IEEE 1547 - Interconnecting DER with Grid',
      'UL 1741 - Inverters for Distributed Generation',
    ];
    standards.forEach((std) => {
      checkPage(5);
      doc.text('- ' + std, margin, y);
      y += 5;
    });
    y += 6;

    // --- Appendix ---
    checkPage(40);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Appendix', margin, y);
    y += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Bill of Materials Summary: Total components: ' + bomItems.length, margin, y);
    y += 6;
    doc.text('Generated: ' + new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + ' | Rev: 1.0', margin, y);
    y += 5;
    doc.text('Project: ' + (projectInfo.projectName || 'Untitled') + ' | Application: ' + projectInfo.application, margin, y);
    y += 10;

    // Add SLD page to PDF - Graphical Single Line Diagram
    doc.addPage();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Single Line Diagram (SLD)', 105, 15, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(projectInfo.projectName || 'Untitled Project', 105, 21, { align: 'center' });

    // --- Helper functions for drawing ---
    function drawBox(x: number, y: number, w: number, h: number, label: string, sublabel: string, fillColor: [number, number, number]) {
      doc.setFillColor(...fillColor);
      doc.setDrawColor(60, 60, 60);
      doc.setLineWidth(0.4);
      doc.roundedRect(x, y, w, h, 2, 2, 'FD');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(20, 20, 20);
      doc.text(label, x + w / 2, y + h / 2 - (sublabel ? 2 : 0), { align: 'center' });
      if (sublabel) {
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text(sublabel, x + w / 2, y + h / 2 + 3.5, { align: 'center' });
      }
    }

    function drawArrowDown(cx: number, y1: number, y2: number) {
      doc.setDrawColor(60, 60, 60);
      doc.setLineWidth(0.3);
      doc.line(cx, y1, cx, y2);
      // arrowhead
      doc.setFillColor(60, 60, 60);
      doc.triangle(cx - 1.5, y2 - 1, cx + 1.5, y2 - 1, cx, y2 + 1.5, 'F');
    }

    function drawLabel(x: number, y: number, text: string, size: number, bold: boolean) {
      doc.setFontSize(size);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setTextColor(40, 40, 40);
      doc.text(text, x, y, { align: 'center' });
    }

    // Layout constants
    const cx = 105; // center x
    const colW = 40;

    // ── 1. PV Array ──
    let sldY = 26;
    const pvW = 52, pvH = 18;
    const pvX = cx - pvW / 2;
    doc.setFillColor(255, 220, 60);
    doc.setDrawColor(200, 160, 0);
    doc.setLineWidth(0.4);
    doc.roundedRect(pvX, sldY, pvW, pvH, 2, 2, 'FD');
    // Draw panel grid lines
    doc.setDrawColor(180, 140, 0);
    doc.setLineWidth(0.2);
    for (let r = 1; r < 3; r++) {
      doc.line(pvX, sldY + r * (pvH / 3), pvX + pvW, sldY + r * (pvH / 3));
    }
    for (let c = 1; c < 5; c++) {
      doc.line(pvX + c * (pvW / 5), sldY, pvX + c * (pvW / 5), sldY + pvH);
    }
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 50, 0);
    doc.text('SOLAR PV ARRAY', cx, sldY + 6, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text((pvDesign.requiredPVPower / 1000).toFixed(1) + ' kWp  |  ' + pvDesign.numberOfPanels + ' panels', cx, sldY + 11, { align: 'center' });
    doc.text(pvDesign.seriesPanels + 'S x ' + pvDesign.parallelStrings + 'P', cx, sldY + 14.5, { align: 'center' });

    // ── 2. DC MCB ──
    sldY += pvH + 5;
    drawArrowDown(cx, sldY - 5, sldY);
    const dcMcbW = 28, dcMcbH = 8;
    drawBox(cx - dcMcbW / 2, sldY, dcMcbW, dcMcbH, 'DC MCB', protectionDevices.mcb.rating + 'A', [220, 230, 255]);

    // ── 3. SPD ──
    sldY += dcMcbH + 5;
    drawArrowDown(cx, sldY - 5, sldY);
    const spdW = 28, spdH = 8;
    drawBox(cx - spdW / 2, sldY, spdW, spdH, 'SPD', protectionDevices.spd.rating + 'V', [255, 220, 220]);

    // ── 4. DC Isolator ──
    sldY += spdH + 5;
    drawArrowDown(cx, sldY - 5, sldY);
    const isoW = 30, isoH = 8;
    drawBox(cx - isoW / 2, sldY, isoW, isoH, 'DC ISOLATOR', protectionDevices.dcIsolator.rating + 'A', [220, 255, 220]);

    // ── 5. Inverter ──
    sldY += isoH + 6;
    drawArrowDown(cx, sldY - 6, sldY);
    const invW = 56, invH = 24;
    const invX = cx - invW / 2;
    doc.setFillColor(230, 220, 255);
    doc.setDrawColor(100, 80, 160);
    doc.setLineWidth(0.5);
    doc.roundedRect(invX, sldY, invW, invH, 3, 3, 'FD');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 40, 120);
    doc.text('INVERTER', cx, sldY + 7, { align: 'center' });
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(inverterDesign.ratedPower + ' kW  |  ' + inverterDesign.systemType.toUpperCase(), cx, sldY + 12, { align: 'center' });
    doc.text(inverterDesign.numberOfMppt + 'x MPPT', cx, sldY + 16.5, { align: 'center' });
    doc.text((inverterDesign.selectedInverter ? inverterDesign.selectedInverter.manufacturer + ' ' + inverterDesign.selectedInverter.model : inverterDesign.systemType.toUpperCase() + ' Inverter'), cx, sldY + 20.5, { align: 'center' });

    // ── 6. Battery Bank (branching from inverter to the right) ──
    const batBranchX = invX + invW + 8;
    const batBranchY = sldY + invH / 2;
    // horizontal line from inverter right side
    doc.setDrawColor(60, 60, 60);
    doc.setLineWidth(0.3);
    doc.line(invX + invW, batBranchY, batBranchX + 4, batBranchY);
    // down to battery
    doc.line(batBranchX + 4, batBranchY, batBranchX + 4, sldY + invH + 4);
    const batW = 36, batH = 20;
    drawBox(batBranchX + 4 - batW / 2, sldY + invH + 4, batW, batH, 'BATTERY BANK', batteryDesign.batteryVoltage + 'V ' + batteryDesign.batteryCapacity + 'Ah\n' + batteryDesign.totalBatteries + ' units', [200, 240, 200]);
    // label on the line
    drawLabel(batBranchX + 4, batBranchY - 2, 'Batt MCB', 5.5, false);

    // ── 7. AC MCB (below inverter) ──
    sldY += invH + 5;
    drawArrowDown(cx, sldY - 5, sldY);
    const acMcbW = 28, acMcbH = 8;
    drawBox(cx - acMcbW / 2, sldY, acMcbW, acMcbH, 'AC MCB', protectionDevices.mccb.rating + 'A', [220, 230, 255]);

    // ── 8. RCBO ──
    sldY += acMcbH + 5;
    drawArrowDown(cx, sldY - 5, sldY);
    const rcboW = 32, rcboH = 8;
    drawBox(cx - rcboW / 2, sldY, rcboW, rcboH, 'RCBO', protectionDevices.rcbo.rating + 'A / 30mA', [255, 240, 220]);

    // ── 9. Busbar split (Grid and Loads) ──
    sldY += rcboH + 5;
    // vertical line down to split
    doc.setDrawColor(60, 60, 60);
    doc.setLineWidth(0.3);
    doc.line(cx, sldY - 5, cx, sldY + 3);
    // horizontal line
    doc.line(cx - 40, sldY + 3, cx + 40, sldY + 3);
    drawLabel(cx, sldY - 1, '', 1, false);

    // ── 10. Grid (left) ──
    doc.line(cx - 40, sldY + 3, cx - 40, sldY + 10);
    drawArrowDown(cx - 40, sldY + 7, sldY + 10);
    const gridW = 36, gridH = 16;
    drawBox(cx - 40 - gridW / 2, sldY + 10, gridW, gridH, 'UTILITY GRID', projectInfo.gridVoltage + 'V ' + projectInfo.frequency + 'Hz', [255, 220, 220]);

    // ── 11. Loads (right) ──
    doc.line(cx + 40, sldY + 3, cx + 40, sldY + 10);
    drawArrowDown(cx + 40, sldY + 7, sldY + 10);
    const loadW = 36, loadH = 16;
    drawBox(cx + 40 - loadW / 2, sldY + 10, loadW, loadH, 'LOADS', fmt(loadProfile.peakDemand) + ' kW', [220, 255, 255]);

    // ── 12. Title block ──
    doc.setDrawColor(60, 60, 60);
    doc.setLineWidth(0.3);
    const tbY = sldY + 30;
    doc.roundedRect(14, tbY, 182, 12, 1, 1, 'S');
    drawLabel(105, tbY + 4.5, 'Drawn by: Eng. Sameer Qatina  |  Solar PV Engineering Co.', 7, false);
    drawLabel(105, tbY + 9, 'Generated: ' + new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + '  |  Rev: 1.0', 6, false);

    // --- BOM Table (no prices) ---
    if (bomItems.length > 0) {
      checkPage(40);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Bill of Materials', margin, y);
      y += 8;

      const bomRows = bomItems.map((item, idx) => [
        String(idx + 1), item.category, item.description || '-',
        item.manufacturer || '-', item.model || '-', String(item.quantity), item.unit,
      ]);

      autoTable(doc, {
        startY: y,
        head: [['#', 'Category', 'Description', 'Mfr', 'Model', 'Qty', 'Unit']],
        body: bomRows,
        styles: { fontSize: 7, cellPadding: 1.5 },
        headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [241, 245, 249] },
        margin: { left: margin, right: margin },
      });
    }

    // Page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        'Generated by Solar PV Engineer | Eng. Sameer Qatina | Page ' + i + ' of ' + pageCount,
        105, doc.internal.pageSize.height - 8, { align: 'center' }
      );
    }

    doc.save('Solar_PV_Report_' + (projectInfo.projectName || 'project') + '.pdf');
  }, [projectInfo, bomItems, pvDesign, financialAnalysis, solarResource, loadProfile, batteryDesign, inverterDesign, cableSizing, protectionDevices]);

  const printReport = useCallback(() => {
    window.print();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <FileText className="w-6 h-6 text-solar-sky" />
            {t('report.title')}
          </h2>
          <p className="text-text-secondary mt-1">{t('report.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={expandAll} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-alt border border-border hover:bg-border/50 transition-colors">
            Expand All
          </button>
          <button onClick={collapseAll} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-alt border border-border hover:bg-border/50 transition-colors">
            Collapse All
          </button>
          <button onClick={printReport} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-solar-sky/10 text-solar-sky hover:bg-solar-sky/20 transition-colors text-sm font-medium">
            <Printer className="w-4 h-4" />
            {t('report.printReport')}
          </button>
          <button onClick={generatePDF} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-solar-sun text-white hover:bg-solar-sun/90 transition-colors text-sm font-medium shadow-sm">
            <Download className="w-4 h-4" />
            {t('report.downloadPdf')}
          </button>
        </div>
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-surface print:border-0">
        <div className="p-4 bg-gradient-to-r from-solar-sky/10 to-solar-sun/5 border-b border-border print:hidden">
          <div className="text-center">
            <h1 className="text-lg font-bold text-text-primary">Solar PV Engineering Co.</h1>
            <p className="text-xs text-text-secondary">Professional Solar PV Engineering Services</p>
          </div>
        </div>

        <div className="p-4 border-b border-border bg-surface-alt/30 print:hidden">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Engineer: Solar PV Engineer</span>
            <span>Date: {new Date().toLocaleDateString()}</span>
            <span>Rev: 1.0</span>
          </div>
        </div>

        <div className="space-y-1">
          {sections.map((section) => {
            const isExpanded = expandedSections.has(section.id);
            return (
              <div key={section.id} className="border-b border-border/50 last:border-b-0">
                <button
                  onClick={() => toggle(section.id)}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-surface-alt/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-solar-sky">{section.icon}</span>
                    <span className="text-sm font-semibold text-text-primary">{section.title}</span>
                  </div>
                  <ChevronDown
                    className={'w-4 h-4 text-text-muted transition-transform duration-200 ' + (isExpanded ? 'rotate-180' : '')}
                  />
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1">{section.content}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-surface-alt/30 border-t border-border text-center">
          <p className="text-xs text-text-muted mb-1">
            This report was generated by Solar PV Engineer. All calculations should be verified by a qualified engineer before construction.
          </p>
          <p className="text-sm font-bold text-text-primary">
            Designed & Engineered by
          </p>
          <p className="text-lg font-bold gradient-text-solar">
            Eng. Sameer Qatina
          </p>
        </div>
      </div>
    </motion.div>
  );
}
