<script lang="ts">
  interface Props {
    title: string;
    description: string;
    href?: string;
    iconLabel: string;
    iconColor: string;
  }

  let { title, description, href, iconLabel, iconColor }: Props = $props();
</script>

{#if href}
  <a
    {href}
    class="group block bg-white rounded-2xl p-6 shadow-sm border border-slate-100
      hover:shadow-md hover:border-primary-200 transition-all duration-200 hover:-translate-y-1"
  >
    <div
      class="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white font-bold text-lg shadow-sm"
      style="background-color: {iconColor}"
    >
      {iconLabel}
    </div>
    <h2 class="text-lg font-semibold text-slate-800 group-hover:text-primary-700 transition-colors">
      {title}
    </h2>
    <p class="mt-2 text-sm text-slate-500">{description}</p>
  </a>
{:else}
  <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
    <div
      class="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white font-bold text-lg shadow-sm"
      style="background-color: {iconColor}"
    >
      {iconLabel}
    </div>
    <h2 class="text-lg font-semibold text-slate-800">{title}</h2>
    <p class="mt-2 text-sm text-slate-500">{description}</p>
  </div>
{/if}
