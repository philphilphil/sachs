<script lang="ts">
  interface Props {
    title: string;
    description: string;
    href?: string;
    icon: string;
    color: string;
    colorLight: string;
    chapter?: string;
    delay?: number;
  }

  let {
    title,
    description,
    href,
    icon,
    color,
    colorLight,
    chapter,
    delay = 0
  }: Props = $props();
</script>

{#if href}
  <a
    {href}
    class="group relative block bg-bg-card rounded-xl border border-border-subtle
      overflow-hidden transition-all duration-300 animate-in
      hover:border-border-hover hover:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] hover:-translate-y-0.5"
    style="animation-delay: {delay}ms;"
  >
    <!-- Accent rail, revealed on hover -->
    <span
      class="absolute left-0 top-0 bottom-0 w-[3px] scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300"
      style="background-color: {color};"
      aria-hidden="true"
    ></span>

    <div class="flex items-start gap-5 p-6">
      <!-- Icon with gradient wash -->
      <div
        class="w-11 h-11 rounded-lg flex items-center justify-center shrink-0
          transition-transform duration-300 group-hover:scale-105 group-hover:rotate-[-3deg]"
        style="background: linear-gradient(135deg, {colorLight} 0%, {colorLight} 60%, #ffffff 100%); color: {color};"
      >
        {@html icon}
      </div>

      <div class="min-w-0 flex-1">
        <h2 class="text-base font-semibold text-text-primary tracking-tight">
          {title}
        </h2>
        <p class="mt-1.5 text-[13.5px] leading-relaxed text-text-secondary">
          {description}
        </p>
      </div>

      {#if chapter}
        <span class="serif italic text-[22px] text-text-tertiary/50 leading-none pt-1 shrink-0 tabular-nums tracking-tight">
          {chapter}
        </span>
      {/if}
    </div>

    <!-- Footer row -->
    <div class="flex items-center justify-between px-6 py-3 border-t border-border-subtle">
      <span class="eyebrow">Open</span>
      <svg
        class="w-4 h-4 text-text-tertiary transition-all duration-300 group-hover:translate-x-1"
        style="--hover-color: {color};"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-7 7 7-7 7" />
      </svg>
    </div>
  </a>
{:else}
  <div
    class="bg-bg-card rounded-xl border border-border-subtle p-6 animate-in opacity-70"
    style="animation-delay: {delay}ms;"
  >
    <div class="flex items-start gap-5">
      <div
        class="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
        style="background-color: {colorLight}; color: {color};"
      >
        {@html icon}
      </div>
      <div class="min-w-0 flex-1">
        <h2 class="text-base font-semibold text-text-primary">{title}</h2>
        <p class="mt-1.5 text-[13.5px] leading-relaxed text-text-secondary">{description}</p>
      </div>
    </div>
  </div>
{/if}
