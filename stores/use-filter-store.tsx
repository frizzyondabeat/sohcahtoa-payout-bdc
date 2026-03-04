import { useDebounce } from '@/hooks/use-debounce';
import { deepEqual, isObjValuesEmpty, pruneEmptyValues } from '@/lib/utils';
import { createClearable } from '@/utils/clear-store';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface FilterComponentState {
  // Form values (temporary, before submit)
  formValues: Record<string, unknown>;
  // Query parameters (what gets sent to the API)
  queryParams: Record<string, unknown>;
  // Metadata
  page: number;
  pageSize: number;
  isApplied: boolean;
}

interface FilterStore {
  components: Record<string, FilterComponentState>;

  // Core actions
  initComponent: (
    name: string,
    defaultValues?: Record<string, unknown>
  ) => void;
  updateFormField: (name: string, field: string, value: unknown) => void;
  updateFormValues: (name: string, values: Record<string, unknown>) => void;
  applyFilters: (name: string, extraParams?: Record<string, unknown>) => void;
  updateQueryParams: (name: string, params: Record<string, unknown>) => void;
  setPage: (name: string, page: number) => void;
  setPageSize: (name: string, pageSize: number) => void;
  clearFilters: (name: string) => void;
  clearFormValues: (
    name: string,
    defaultValues?: Record<string, unknown>
  ) => void;
  resetComponent: (
    name: string,
    defaultValues?: Record<string, unknown>
  ) => void;
}

const createDefaultComponentState = (): FilterComponentState => ({
  formValues: {},
  queryParams: {},
  page: 1,
  pageSize: 10,
  isApplied: false,
});

const useFilterStore = createClearable(['all', 'query-filters'])(
  devtools(
    persist(
      immer<FilterStore>((set) => ({
        components: {},

        initComponent: (name, defaultValues = {}) =>
          set((state) => {
            if (!state.components[name]) {
              state.components[name] = {
                ...createDefaultComponentState(),
                formValues: defaultValues,
              };
            }
          }),

        updateFormField: (name, field, value) =>
          set((state) => {
            if (!state.components[name]) return;
            state.components[name].formValues[field] = value;
          }),

        updateFormValues: (name, values) =>
          set((state) => {
            if (!state.components[name]) return;
            state.components[name].formValues = {
              ...state.components[name].formValues,
              ...values,
            };
          }),

        applyFilters: (name, extraParams = {}) =>
          set((state) => {
            if (!state.components[name]) return;

            const component = state.components[name];
            component.queryParams = pruneEmptyValues({
              ...component.formValues,
              ...extraParams,
              page: component.page,
              pageSize: component.pageSize,
            });
            component.isApplied = true;
            component.page = 1; // Reset page when applying new filters

            // Update queryParams with reset page
            component.queryParams.page = 1;
          }),

        updateQueryParams: (name, params) =>
          set((state) => {
            if (!state.components[name]) return;
            state.components[name].queryParams = {
              ...state.components[name].queryParams,
              ...params,
            };
          }),

        setPage: (name, page) =>
          set((state) => {
            if (!state.components[name]) return;
            state.components[name].page = page;
            state.components[name].queryParams = {
              ...state.components[name].queryParams,
              page,
            };
          }),

        setPageSize: (name, pageSize) =>
          set((state) => {
            if (!state.components[name]) return;
            state.components[name].pageSize = pageSize;
            state.components[name].page = 1;
            state.components[name].queryParams = {
              ...state.components[name].queryParams,
              pageSize,
              page: 1,
            };
          }),

        clearFilters: (name) =>
          set((state) => {
            if (!state.components[name]) return;
            state.components[name].queryParams = {
              page: 1,
              pageSize: state.components[name].pageSize,
            };
            state.components[name].page = 1;
            state.components[name].isApplied = false;
          }),

        clearFormValues: (name, defaultValues = {}) =>
          set((state) => {
            if (!state.components[name]) return;
            state.components[name].formValues = defaultValues;
            state.components[name].isApplied = false;
          }),

        resetComponent: (name, defaultValues = {}) =>
          set((state) => {
            state.components[name] = {
              ...createDefaultComponentState(),
              formValues: defaultValues,
            };
          }),
      })),
      {
        name: 'query-filter-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ components: state.components }),
      }
    ),
    { name: 'QueryFilterStore' }
  )
);

// Hook interface optimized for React Query
export interface UseQueryFilterParams {
  componentName: string;
  defaultValues?: Record<string, unknown>;
  searchFields?: string[]; // Fields that should be debounced and auto-applied
  debounceMs?: number;
  enabledCondition?: boolean; // For conditional query enabling
}

export interface UseQueryFilterReturn {
  // State for forms
  formValues: Record<string, unknown>;
  page: number;
  pageSize: number;
  isApplied: boolean;
  disabled: boolean;

  // Query parameters (use this with your query hook)
  queryParams: Record<string, unknown>;

  // Form handlers
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleSelect: (name: string, value: unknown) => void;
  handleCheckbox: (name: string, value: unknown) => void;
  handleMultipleCheckbox: (name: string, value: string) => void;
  isMultipleCheckboxChecked: (name: string, value: string) => boolean;

  // Actions
  applyFilters: (extraParams?: Record<string, unknown>) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  clearFilters: () => void;
  clearFormValues: () => void;
  resetAll: () => void;
  updateQueryParams: (params: Record<string, unknown>) => void;
}

export const useQueryFilter = ({
  componentName,
  defaultValues = {},
  searchFields = [],
  debounceMs = 1000,
  enabledCondition = true,
}: UseQueryFilterParams): UseQueryFilterReturn => {
  const {
    components,
    initComponent,
    updateFormField,
    applyFilters: storeApplyFilters,
    updateQueryParams,
    setPage: storeSetPage,
    setPageSize: storeSetPageSize,
    clearFilters: storeClearFilters,
    clearFormValues: storeClearFormValues,
    resetComponent,
  } = useFilterStore();

  // Memoize defaultValues to prevent unnecessary re-initializations
  const memoizedDefaultValues = useMemo(() => defaultValues, [defaultValues]);

  // Memoize searchFields to prevent dependency changes
  const memoizedSearchFields = useMemo(() => searchFields, [searchFields]);

  // Initialize component
  useEffect(() => {
    initComponent(componentName, memoizedDefaultValues);
  }, [componentName, memoizedDefaultValues, initComponent]);

  // Get current component state
  const componentState =
    components[componentName] || createDefaultComponentState();
  const { formValues, queryParams, page, pageSize, isApplied } = componentState;

  // Extract search values for debouncing
  const searchValues = useMemo(() => {
    const search: Record<string, unknown> = {};
    memoizedSearchFields.forEach((field) => {
      if (formValues[field] !== undefined && formValues[field] !== '') {
        search[field] = formValues[field];
      }
    });
    return search;
  }, [formValues, memoizedSearchFields]);

  // Debounce search values
  const debouncedSearchValues = useDebounce(searchValues, debounceMs);

  // Use refs to store previous values and avoid unnecessary updates
  const prevDebouncedValuesRef = useRef<Record<string, unknown>>({});
  const isInitializedRef = useRef(false);

  // Auto-apply search filters when debounced values change
  useEffect(() => {
    // Skip the first run to avoid initial application
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      prevDebouncedValuesRef.current = { ...debouncedSearchValues };
      return;
    }

    // Only proceed if there are search fields configured
    if (memoizedSearchFields.length === 0) return;

    // Check if debounced values have actually changed using deep comparison
    const hasChanged = !deepEqual(
      prevDebouncedValuesRef.current,
      debouncedSearchValues
    );

    if (hasChanged) {
      // Get current non-search params from queryParams
      const currentNonSearchParams = { ...queryParams };
      memoizedSearchFields.forEach((field) => {
        delete currentNonSearchParams[field];
      });

      // Explicitly include all search fields (including '' when cleared) so merge overwrites old values
      const searchParamsForQuery: Record<string, unknown> = {};
      memoizedSearchFields.forEach((field) => {
        searchParamsForQuery[field] = debouncedSearchValues[field] ?? '';
      });

      const newQueryParams = {
        ...currentNonSearchParams,
        ...searchParamsForQuery,
        page: 1, // Reset page when search changes
        pageSize: pageSize, // Preserve current page size
      };

      updateQueryParams(componentName, newQueryParams);

      // Update the ref with current values
      prevDebouncedValuesRef.current = { ...debouncedSearchValues };
    }
  }, [
    debouncedSearchValues,
    componentName,
    updateQueryParams,
    memoizedSearchFields,
    pageSize,
    queryParams,
  ]);

  // Check if non-search form fields are empty (for disabling submit)
  const disabled = useMemo(() => {
    const nonSearchValues = { ...formValues };
    memoizedSearchFields.forEach((field) => delete nonSearchValues[field]);
    return isObjValuesEmpty(nonSearchValues);
  }, [formValues, memoizedSearchFields]);

  // Memoize form handlers to prevent recreation on every render
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      updateFormField(componentName, e.target.name, e.target.value);
    },
    [componentName, updateFormField]
  );

  const handleSelect = useCallback(
    (name: string, value: unknown) => {
      updateFormField(componentName, name, value);
    },
    [componentName, updateFormField]
  );

  const handleCheckbox = useCallback(
    (name: string, value: unknown) => {
      const currentValue = formValues[name];
      const newValue = currentValue === value ? '' : value;
      updateFormField(componentName, name, newValue);
    },
    [componentName, formValues, updateFormField]
  );

  const handleMultipleCheckbox = useCallback(
    (name: string, value: string) => {
      const currentValue = (formValues[name] as string) || '';
      const currentArray = currentValue
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v);

      let newArray: string[];
      if (currentArray.includes(value)) {
        newArray = currentArray.filter((v) => v !== value);
      } else {
        newArray = [...currentArray, value];
      }

      updateFormField(componentName, name, newArray.join(','));
    },
    [componentName, formValues, updateFormField]
  );

  const isMultipleCheckboxChecked = useCallback(
    (name: string, value: string): boolean => {
      const currentValue = (formValues[name] as string) || '';
      if (!currentValue) return false;

      const currentArray = currentValue
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v);
      return currentArray.includes(value);
    },
    [formValues]
  );

  // Action handlers
  const applyFilters = useCallback(
    (extraParams?: Record<string, unknown>) => {
      storeApplyFilters(componentName, extraParams);
    },
    [componentName, storeApplyFilters]
  );

  const setPage = useCallback(
    (page: number) => {
      storeSetPage(componentName, page);
    },
    [componentName, storeSetPage]
  );

  const setPageSize = useCallback(
    (pageSize: number) => {
      storeSetPageSize(componentName, pageSize);
    },
    [componentName, storeSetPageSize]
  );

  const clearFilters = useCallback(() => {
    storeClearFilters(componentName);
  }, [componentName, storeClearFilters]);

  const clearFormValues = useCallback(() => {
    storeClearFormValues(componentName, memoizedDefaultValues);
  }, [componentName, memoizedDefaultValues, storeClearFormValues]);

  const resetAll = useCallback(() => {
    resetComponent(componentName, memoizedDefaultValues);
  }, [componentName, memoizedDefaultValues, resetComponent]);

  // Create a wrapped version of updateQueryParams that includes the component name
  const wrappedUpdateQueryParams = useCallback(
    (params: Record<string, unknown>) => {
      updateQueryParams(componentName, params);
    },
    [componentName, updateQueryParams]
  );

  return {
    // State
    formValues,
    queryParams: enabledCondition ? queryParams : {},
    page,
    pageSize,
    isApplied,
    disabled,

    // Form handlers
    handleChange,
    handleSelect,
    handleCheckbox,
    handleMultipleCheckbox,
    isMultipleCheckboxChecked,

    // Actions
    applyFilters,
    setPage,
    setPageSize,
    clearFilters,
    clearFormValues,
    resetAll,
    updateQueryParams: wrappedUpdateQueryParams,
  };
};
