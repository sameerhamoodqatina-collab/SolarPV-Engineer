'use client';

import { useMemo, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  MapPin,
  Globe,
  Building2,
  Factory,
  Sprout,
  HeartPulse,
  Server,
  Hammer,
  Home,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import {
  countries,
  getCitiesByCountry,
  getCityData,
  type CountryData,
} from '@/lib/data/countries';
import type { ProjectInfo, ApplicationType } from '@/lib/types';

interface ProjectInfoStepProps {
  data: ProjectInfo;
  onUpdate: (data: Partial<ProjectInfo>) => void;
}

const gridVoltages = [120, 220, 230, 240, 380, 400, 415, 480] as const;
const frequencies = [50, 60] as const;

const applicationTypes: {
  value: ApplicationType;
  icon: React.ElementType;
}[] = [
  { value: 'residential', icon: Home },
  { value: 'commercial', icon: Building2 },
  { value: 'industrial', icon: Factory },
  { value: 'agriculture', icon: Sprout },
  { value: 'hospital', icon: HeartPulse },
  { value: 'datacenter', icon: Server },
  { value: 'factory', icon: Hammer },
];

function createSchema(t: (k: string) => string) {
  return z.object({
    projectName: z.string().min(1, t('validation.required')),
    country: z.string().min(1, t('validation.required')),
    city: z.string().min(1, t('validation.required')),
    latitude: z
      .number({ error: t('validation.invalidNumber') })
      .min(-90, t('validation.latitudeRange'))
      .max(90, t('validation.latitudeRange')),
    longitude: z
      .number({ error: t('validation.invalidNumber') })
      .min(-180, t('validation.longitudeRange'))
      .max(180, t('validation.longitudeRange')),
    gridVoltage: z.number(),
    frequency: z.number(),
    phaseType: z.enum(['single', 'three']),
    application: z.custom<ApplicationType>(),
  });
}

type FormValues = z.infer<ReturnType<typeof createSchema>>;

const inputClass = `
  w-full rounded-xl border border-slate-700/60 bg-slate-900/60 
  px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500
  backdrop-blur-sm transition-all duration-200
  focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 focus:outline-none
  hover:border-slate-500
`;

const labelClass =
  'block text-xs font-medium text-slate-400 mb-1.5 tracking-wide uppercase';
const errorClass = 'mt-1 text-xs text-red-400';

export default function ProjectInfoStep({
  data,
  onUpdate,
}: ProjectInfoStepProps) {
  const { t, isRTL } = useLanguage();

  const schema = useMemo(() => createSchema(t), [t]);

  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      projectName: data.projectName,
      country: data.country,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      gridVoltage: data.gridVoltage,
      frequency: data.frequency,
      phaseType: data.phaseType,
      application: data.application,
    },
    resolver: zodResolver(schema),
  });

  const watchedCountry = watch('country');
  const watchedCity = watch('city');

  const selectedCountry: CountryData | undefined = useMemo(
    () => countries.find((c) => c.code === watchedCountry),
    [watchedCountry],
  );

  const cityList = useMemo(
    () => (watchedCountry ? getCitiesByCountry(watchedCountry) : []),
    [watchedCountry],
  );

  const handleCountryChange = useCallback(
    (code: string) => {
      setValue('country', code);
      setValue('city', '');
      onUpdate({ country: code, city: '', latitude: 0, longitude: 0 });
    },
    [setValue, onUpdate],
  );

  const handleCityChange = useCallback(
    (cityName: string) => {
      setValue('city', cityName);
      const cityData = getCityData(watchedCountry, cityName);
      if (cityData) {
        setValue('latitude', cityData.latitude);
        setValue('longitude', cityData.longitude);
        onUpdate({
          city: cityName,
          latitude: cityData.latitude,
          longitude: cityData.longitude,
        });
      } else {
        onUpdate({ city: cityName });
      }
    },
    [watchedCountry, setValue, onUpdate],
  );

  const fieldChange = useCallback(
    (field: keyof FormValues, value: string | number | boolean) => {
      onUpdate({ [field]: value } as Partial<ProjectInfo>);
    },
    [onUpdate],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      dir={isRTL ? 'rtl' : 'ltr'}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-slate-100">
          {t('project.title')}
        </h2>
        <p className="mt-1 text-sm text-slate-400">{t('project.subtitle')}</p>
      </div>

      {/* Project Name */}
      <div className="rounded-2xl border border-slate-700/40 bg-slate-900/50 backdrop-blur-md p-5">
        <label className={labelClass}>{t('project.projectName')}</label>
        <Controller
          name="projectName"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              placeholder={t('project.projectNamePlaceholder')}
              className={inputClass}
              onChange={(e) => {
                field.onChange(e.target.value);
                fieldChange('projectName', e.target.value);
              }}
            />
          )}
        />
        {errors.projectName && (
          <p className={errorClass}>{errors.projectName.message}</p>
        )}
      </div>

      {/* Location */}
      <div className="rounded-2xl border border-slate-700/40 bg-slate-900/50 backdrop-blur-md p-5 space-y-4">
        <div className="flex items-center gap-2 text-slate-300">
          <MapPin className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold uppercase tracking-wider">
            {t('project.location')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Country */}
          <div>
            <label className={labelClass}>{t('project.country')}</label>
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className={inputClass}
                  onChange={(e) => handleCountryChange(e.target.value)}
                >
                  <option value="">{t('project.countryPlaceholder')}</option>
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {isRTL ? c.nameAr : c.name}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.country && (
              <p className={errorClass}>{errors.country.message}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label className={labelClass}>{t('project.city')}</label>
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className={inputClass}
                  disabled={!watchedCountry}
                  onChange={(e) => handleCityChange(e.target.value)}
                >
                  <option value="">{t('project.cityPlaceholder')}</option>
                  {cityList.map((c) => (
                    <option key={c.name} value={c.name}>
                      {isRTL ? c.nameAr : c.name}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.city && <p className={errorClass}>{errors.city.message}</p>}
          </div>
        </div>

        {/* Coordinates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t('project.latitude')}</label>
            <Controller
              name="latitude"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  step="any"
                  placeholder={t('project.latitudePlaceholder')}
                  className={inputClass}
                  value={field.value || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    field.onChange(isNaN(val) ? 0 : val);
                    fieldChange('latitude', isNaN(val) ? 0 : val);
                  }}
                />
              )}
            />
            {errors.latitude && (
              <p className={errorClass}>{errors.latitude.message}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>{t('project.longitude')}</label>
            <Controller
              name="longitude"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  step="any"
                  placeholder={t('project.longitudePlaceholder')}
                  className={inputClass}
                  value={field.value || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    field.onChange(isNaN(val) ? 0 : val);
                    fieldChange('longitude', isNaN(val) ? 0 : val);
                  }}
                />
              )}
            />
            {errors.longitude && (
              <p className={errorClass}>{errors.longitude.message}</p>
            )}
          </div>
        </div>

        {watchedCity && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-400/10 border border-amber-400/20 px-4 py-2 text-xs text-amber-300">
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span>
              {selectedCountry?.name}, {watchedCity}
            </span>
          </div>
        )}
      </div>

      {/* Grid Settings */}
      <div className="rounded-2xl border border-slate-700/40 bg-slate-900/50 backdrop-blur-md p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Grid Configuration
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Grid Voltage */}
          <div>
            <label className={labelClass}>{t('project.gridVoltage')}</label>
            <Controller
              name="gridVoltage"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className={inputClass}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    field.onChange(val);
                    fieldChange('gridVoltage', val);
                  }}
                >
                  {gridVoltages.map((v) => (
                    <option key={v} value={v}>
                      {v} V
                    </option>
                  ))}
                </select>
              )}
            />
          </div>

          {/* Frequency */}
          <div>
            <label className={labelClass}>{t('project.frequency')}</label>
            <Controller
              name="frequency"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className={inputClass}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    field.onChange(val);
                    fieldChange('frequency', val);
                  }}
                >
                  {frequencies.map((f) => (
                    <option key={f} value={f}>
                      {f} Hz
                    </option>
                  ))}
                </select>
              )}
            />
          </div>

          {/* Phase Type */}
          <div>
            <label className={labelClass}>{t('project.phaseType')}</label>
            <Controller
              name="phaseType"
              control={control}
              render={({ field }) => (
                <div className="flex rounded-xl border border-slate-700/60 bg-slate-900/60 overflow-hidden">
                  {(['single', 'three'] as const).map((pt) => (
                    <button
                      key={pt}
                      type="button"
                      className={`
                        flex-1 py-2.5 text-xs font-medium transition-all duration-200
                        ${
                          field.value === pt
                            ? 'bg-amber-400/15 text-amber-400 border-b-2 border-amber-400'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                        }
                      `}
                      onClick={() => {
                        field.onChange(pt);
                        fieldChange('phaseType', pt);
                      }}
                    >
                      {pt === 'single'
                        ? t('project.singlePhase')
                        : t('project.threePhase')}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>
        </div>
      </div>

      {/* Application Type */}
      <div className="rounded-2xl border border-slate-700/40 bg-slate-900/50 backdrop-blur-md p-5 space-y-4">
        <label className={labelClass}>{t('project.application')}</label>

        <Controller
          name="application"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {applicationTypes.map(({ value, icon: Icon }) => {
                const isActive = field.value === value;
                return (
                  <motion.button
                    key={value}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      relative flex flex-col items-center gap-2 p-4 rounded-xl
                      border transition-all duration-200 text-center
                      ${
                        isActive
                          ? 'border-amber-400/60 bg-amber-400/10 shadow-[0_0_20px_rgba(251,191,36,0.12)]'
                          : 'border-slate-700/50 bg-slate-800/40 hover:border-slate-500 hover:bg-slate-800/60'
                      }
                    `}
                    onClick={() => {
                      field.onChange(value);
                      fieldChange('application', value);
                    }}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        isActive ? 'text-amber-400' : 'text-slate-400'
                      }`}
                    />
                    <span
                      className={`text-xs font-medium ${
                        isActive ? 'text-amber-400' : 'text-slate-300'
                      }`}
                    >
                      {t(`applications.${value}`)}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          )}
        />
      </div>
    </motion.div>
  );
}
