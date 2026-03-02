<script lang="ts">
  import { List as ListIcon } from "@lucide/svelte";
  
  export let onSave: (() => void) | null = null;

  export let onApply: (payload: {
    selectedTypes: string[]; // file types
    minSize?: number;
    maxSize?: number;
    storageClasses?: string[];
    date?: string; // YYYY-MM-DD
    condition?: "after" | "before" | "";
  }) => void = () => {};

  export let initialFilters: {
    suffixes?: string[];
    minSize?: number;
    maxSize?: number;
    storageClasses?: string[];
    modifiedAfter?: string;
    modifiedBefore?: string;
  } | null = null;

  export function getCurrentFilters() {
    const minSize = minSizeInput
      ? Math.round(Number(minSizeInput) * minUnit)
      : undefined;

    const maxSize = maxSizeInput
      ? Math.round(Number(maxSizeInput) * maxUnit)
      : undefined;

    const result: {
      suffixes?: string[];
      minSize?: number;
      maxSize?: number;
      storageClasses?: string[];
      modifiedAfter?: string;
      modifiedBefore?: string;
    } = {};

    if (selectedTypes.length > 0) {
      result.suffixes = selectedTypes;
    }

    if (typeof minSize === "number") {
      result.minSize = minSize;
    }

    if (typeof maxSize === "number") {
      result.maxSize = maxSize;
    }

    if (selectedStorageClasses.length > 0) {
      result.storageClasses = selectedStorageClasses;
    }

    if (dateValue) {
      if (dateCondition === "after") {
        result.modifiedAfter = dateValue;
      } else {
        result.modifiedBefore = dateValue;
      }
    }

    return result;
  }

  let dropdownOpen = false;
  let selectedTypes: string[] = [];
  let minSizeInput = "";
  let maxSizeInput = "";
  const allStorageClasses = ["STANDARD", "GLACIER", "INTELLIGENT_TIERING"];
  let selectedStorageClasses: string[] = [];
  let dateValue = "";
  let dateCondition: "before" | "after" | "" = "before";
  let minUnit = 1;
  let maxUnit = 1;
  let unitConversion = [
    { label: "B", value: 1 },
    { label: "KB", value: 1024 },
    { label: "MB", value: 1024 ** 2 },
    { label: "GB", value: 1024 ** 3 },
  ];
  let customType = "";

  function toggleDropdown() {
    dropdownOpen = !dropdownOpen;
  }

  $: {
    selectedTypes;
    minSizeInput;
    maxSizeInput;
    selectedStorageClasses;
    dateValue;
    dateCondition;
    minUnit;
    maxUnit;

    if (dropdownOpen) {
      sendFilter();
    }
  }

let lastInitialFilters: any = null;

$: if (initialFilters && initialFilters !== lastInitialFilters) {
    lastInitialFilters = initialFilters;

    selectedTypes = initialFilters.suffixes ?? [];

    minSizeInput = initialFilters.minSize
      ? String(initialFilters.minSize)
      : "";

    maxSizeInput = initialFilters.maxSize
      ? String(initialFilters.maxSize)
      : "";

    selectedStorageClasses =
      initialFilters.storageClasses ?? [];

    if (initialFilters.modifiedAfter) {
      dateValue = initialFilters.modifiedAfter;
      dateCondition = "after";
    } else if (initialFilters.modifiedBefore) {
      dateValue = initialFilters.modifiedBefore;
      dateCondition = "before";
    } else {
      dateValue = "";
    }
  }

  function sendFilter() {
    const minSize = minSizeInput
      ? Math.round(Number(minSizeInput) * minUnit)
      : undefined;
    const maxSize = maxSizeInput
      ? Math.round(Number(maxSizeInput) * maxUnit)
      : undefined;

    const payload = {
      selectedTypes,
      minSize: Number.isNaN(minSize as Number) ? undefined : minSize,
      maxSize: Number.isNaN(maxSize as Number) ? undefined : maxSize,
      storageClasses:
        selectedStorageClasses.length > 0 ? selectedStorageClasses : undefined,
      date: dateValue.trim() || undefined,
      condition: dateValue.trim() ? dateCondition : "",
    };

    onApply(payload);
  }

  function resetFilters() {
    selectedTypes = [];
    minSizeInput = "";
    maxSizeInput = "";
    selectedStorageClasses = [];
    dateValue = "";
    dateCondition = "before";
    minUnit = 1;
    maxUnit = 1;
  }

  function addCustomType() {
    const type = customType.trim().toLowerCase().replace(".", "");
    if (type && !selectedTypes.includes(type)) {
      selectedTypes = [...selectedTypes, type];
      customType = "";
    }
  }

  function clickOutside(node: HTMLElement) {
    const handleClick = (event: MouseEvent) => {
      if (
        dropdownOpen &&
        node &&
        !node.contains(event.target as Node) &&
        !event.defaultPrevented
      ) {
        dropdownOpen = false;
      }
    };

    document.addEventListener("click", handleClick, true);

    return {
      destroy() {
        document.removeEventListener("click", handleClick, true);
      },
    };
  }

  // Saved filters
  export let savedFilters: { name: string; filters: typeof initialFilters }[] = [];

  // Show saved filters instead of creating new
  let showSavedFilters = false;
  let savedFilterSearch = "";

  $: filteredSavedFilters =
  savedFilterSearch.trim() === ""
    ? savedFilters
    : savedFilters.filter(f =>
        f.name.toLowerCase().includes(savedFilterSearch.toLowerCase())
      );

  // Delete saved filter
  export let onDelete: ((name: string) => void) | null = null;

  // Apply a saved filter
  function applySavedFilter(filter: any) {
    selectedTypes = filter.suffixes ?? [];
    minSizeInput = filter.minSize ? String(filter.minSize) : "";
    maxSizeInput = filter.maxSize ? String(filter.maxSize) : "";
    selectedStorageClasses = filter.storageClasses ?? [];
    if (filter.modifiedAfter) {
      dateValue = filter.modifiedAfter;
      dateCondition = "after";
    } else if (filter.modifiedBefore) {
      dateValue = filter.modifiedBefore;
      dateCondition = "before";
    } else {
      dateValue = "";
    }
    sendFilter();
    dropdownOpen = false;
  }
</script>

<div class="relative">
  <button
    type="button"
    on:click|stopPropagation={toggleDropdown}
    class="border p-2 rounded bg-gray-100 hover:bg-gray-200 flex items-center gap-2"
  >
    <ListIcon class="w-4 h-4" />
    <span>Filter</span>
  </button>

  {#if dropdownOpen}
    <div
      use:clickOutside
      class="absolute mt-1 border rounded bg-white shadow p-4 w-80 z-10"
    >
      <div class="mb-2 flex gap-2">
        <button
          type="button"
          class="px-2 py-1 text-xs rounded hover:bg-gray-200"
          class:bg-blue-200={ !showSavedFilters }
          on:click={() => showSavedFilters = false}
        >
          New Filter
        </button>
        <button
          type="button"
          class="px-2 py-1 text-xs rounded hover:bg-gray-200"
          class:bg-blue-200={ showSavedFilters }
          on:click={() => showSavedFilters = true}
        >
          Saved Filters
        </button>
      </div>

      {#if !showSavedFilters}
        <div class="mb-4">
          <h4 class="font-semibold mb-2">File types</h4>
          <div class="flex flex-col gap-1">
            {#each ["zip", "pdf", "png", "jpg", "txt"] as type}
              <label class="flex items-center gap-2">
                <input type="checkbox" value={type} bind:group={selectedTypes} />
                <span class="uppercase">{type}</span>
              </label>
            {/each}

            {#each selectedTypes.filter((t) => !["zip", "pdf", "png", "jpg", "txt"].includes(t)) as type}
              <label class="flex items-center gap-2 text-blue-600">
                <input type="checkbox" value={type} bind:group={selectedTypes} />
                <span class="uppercase font-medium text-xs">{type}</span>
              </label>
            {/each}

            <div class="mt-2">
              <input
                type="text"
                placeholder="+ add type (e.g. csv, tif, ai)"
                bind:value={customType}
                on:keydown={(e) => e.key === "Enter" && addCustomType()}
                class="border p-1 rounded text-xs w-full outline-none focus:border-blue-400 bg-gray-50 italic"
              />
            </div>
          </div>
        </div>

        <!-- Size -->
        <div class="mb-4">
          <h4 class="font-semibold mb-1 text-sm">Size</h4>
          <div class="flex gap-4">
            <div class="flex flex-col">
              <span
                class="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5"
                >Min</span
              >
              <div class="flex items-center gap-1">
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0"
                  bind:value={minSizeInput}
                  class="border p-1 rounded w-20 text-xs outline-none focus:border-blue-400"
                />
                <select
                  bind:value={minUnit}
                  class="border p-1 rounded bg-gray-50 text-[10px] h-[30px] cursor-pointer outline-none border-black-300"
                >
                  {#each unitConversion as unit}
                    <option value={unit.value}>{unit.label}</option>
                  {/each}
                </select>
              </div>
            </div>

            <div class="flex flex-col">
              <span
                class="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5"
                >Max</span
              >
              <div class="flex items-center gap-1">
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Any"
                  bind:value={maxSizeInput}
                  class="border p-1 rounded w-20 text-xs outline-none focus:border-blue-400"
                />
                <select
                  bind:value={maxUnit}
                  class="border p-1 rounded bg-gray-50 text-[10px] h-[30px] cursor-pointer outline-none border-black-300"
                >
                  {#each unitConversion as unit}
                    <option value={unit.value}>{unit.label}</option>
                  {/each}
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Storage Container -->
        <div class="mb-4">
          <h4 class="font-semibold mb-2">Storage class</h4>
          <div class="flex flex-col gap-1">
            {#each allStorageClasses as storageClass}
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={storageClass}
                  checked={selectedStorageClasses.includes(storageClass)}
                  bind:group={selectedStorageClasses}
                />
                {storageClass}
              </label>
            {/each}
          </div>
        </div>

        <!-- Date -->
        <div class="mb-4">
          <h4 class="font-semibold mb-2">Last modified</h4>
          <div class="flex gap-2 items-center">
            <input
              type="date"
              bind:value={dateValue}
              class="border p-1 rounded w-32 text-sm"
            />
            <select
              bind:value={dateCondition}
              class="border p-1 rounded h-[32px] text-sm bg-white"
            >
              <option value="before">Before</option>
              <option value="after">After</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          on:click={resetFilters}
          class="text-xs text-gray-400 hover:text-gray-600 hover:underline transition-all"
        >
          Clear all filters
        </button>

        <button
          type="button"
          class="text-xs text-white bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
          on:click={() => onSave && onSave()}
        >
          Save Filter
        </button>

      {:else}
        <!-- Saved filters list -->

        <!-- Search input -->
        <input
          type="text"
          placeholder="Search saved filters..."
          bind:value={savedFilterSearch}
          class="border p-1 rounded text-xs w-full mb-2 outline-none focus:border-blue-400"
        />

        {#if filteredSavedFilters.length === 0}
          <p class="text-xs text-gray-500 italic">
            {savedFilterSearch
              ? "No matching filters found"
              : "No saved filters yet"}
          </p>
        {:else}
          <div class="flex flex-col gap-1 max-h-64 overflow-y-auto">
            {#each filteredSavedFilters as filter}
              <div class="flex flex-col border rounded p-2 hover:bg-gray-100">
                <div class="flex justify-between items-center">
                  <button
                    type="button"
                    class="text-sm text-left flex-1 font-medium"
                    on:click={() => applySavedFilter(filter.filters)}
                  >
                    {filter.name}
                  </button>

                  <button
                    type="button"
                    class="text-xs text-gray-400 hover:text-red-500"
                    on:click={() => onDelete && onDelete(filter.name)}
                  >
                    ✕
                  </button>
                </div>

                <div class="text-xs text-gray-500 mt-1">
                  {#if filter.filters?.suffixes}
                    {filter.filters.suffixes.join(", ")}
                  {/if}
                  {#if filter.filters?.minSize}
                    | min {filter.filters.minSize}
                  {/if}
                  {#if filter.filters?.maxSize}
                    | max {filter.filters.maxSize}
                  {/if}
                  {#if filter.filters?.storageClasses}
                    | {filter.filters.storageClasses.join(", ")}
                  {/if}
                  {#if filter.filters?.modifiedAfter}
                    | after {filter.filters.modifiedAfter}
                  {/if}
                  {#if filter.filters?.modifiedBefore}
                    | before {filter.filters.modifiedBefore}
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      {/if} 
    </div>
  {/if}
</div>
