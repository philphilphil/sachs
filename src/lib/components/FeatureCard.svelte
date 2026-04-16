<script lang="ts">
  interface Props {
    title: string;
    description: string;
    href?: string;
    icon: string;
    color: string;
    colorLight: string;
    delay?: number;
  }

  let { title, description, href, icon, color, colorLight, delay = 0 }: Props = $props();
</script>

{#if href}
  <a
    {href}
    class="group block bg-bg-card rounded-xl border border-border p-6
      hover:border-border-hover hover:shadow-sm
      transition-all duration-200
      animate-in"
    style="animation-delay: {delay}ms;"
  >
    <div class="flex items-start gap-4">
      <!-- Icon -->
      <div
        class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0
          transition-transform duration-200 group-hover:scale-105"
        style="background-color: {colorLight}; color: {color};"
      >
        {@html icon}
      </div>

      <div class="min-w-0">
        <h2 class="text-[15px] font-semibold text-text-primary group-hover:text-accent transition-colors duration-200">
          {title}
        </h2>
        <p class="mt-1 text-[13px] leading-relaxed text-text-secondary">
          {description}
        </p>
      </div>
    </div>

    <!-- Bottom row -->
    <div class="mt-4 pt-3 border-t border-border flex items-center justify-between">
      <span class="text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
        Open trainer
      </span>
      <svg
        class="w-4 h-4 text-text-tertiary group-hover:text-accent group-hover:translate-x-0.5 transition-all duration-200"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </a>
{:else}
  <div
    class="bg-bg-card rounded-xl border border-border p-6 animate-in"
    style="animation-delay: {delay}ms;"
  >
    <div class="flex items-start gap-4">
      <div
        class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style="background-color: {colorLight}; color: {color};"
      >
        {@html icon}
      </div>
      <div class="min-w-0">
        <h2 class="text-[15px] font-semibold text-text-primary">{title}</h2>
        <p class="mt-1 text-[13px] leading-relaxed text-text-secondary">{description}</p>
      </div>
    </div>
  </div>
{/if}
