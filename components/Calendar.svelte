<!--
  @component Calendar

  Full-page scheduling calendar with month, week, and day views.
  Events rendered as colored blocks with title, time, and optional status.
  Navigation with prev/next, today button, and view switcher.
  Consumes --calendar-* tokens from components.css.

  @example Basic month view
  <Calendar events={events} oneventclick={(ev) => console.log(ev)} />

  @example Week view with locale
  <Calendar view="week" events={events} locale={pt} />

  @example Custom event rendering
  <Calendar events={events}>
    {#snippet event(ev)}
      <span>{ev.title}</span>
      <Badge>{ev.status}</Badge>
    {/snippet}
  </Calendar>
-->
<script>
  import {
    format,
    startOfMonth, endOfMonth,
    startOfWeek, endOfWeek,
    startOfDay, endOfDay,
    addDays, addWeeks, subWeeks, addMonths, subMonths,
    isSameDay, isSameMonth, isBefore
  } from 'date-fns';
  import { enUS } from 'date-fns/locale';

  /**
   * @typedef {'month' | 'week' | 'day'} View
   * @typedef {Object} CalendarEvent
   * @property {string | number} id
   * @property {string} title
   * @property {Date} start
   * @property {Date} [end]
   * @property {string} [color] - CSS color or custom property
   * @property {string} [status]
   * @property {boolean} [allDay]
   */

  let {
    /** @type {View} */
    view = $bindable('month'),
    /** @type {Date} */
    date = $bindable(new Date()),
    /** @type {CalendarEvent[]} */
    events = [],
    /** @type {number} — max visible events per month cell */
    maxVisible = 3,
    /** @type {import('date-fns').Locale} */
    locale = enUS,
    /** @type {((event: CalendarEvent) => void) | undefined} */
    oneventclick = undefined,
    /** @type {((date: Date) => void) | undefined} */
    ondateclick = undefined,
    /** @type {import('svelte').Snippet<[CalendarEvent]> | undefined} */
    event: eventSnippet = undefined,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  // ─── Shared derived ───

  const weekdays = $derived(getWeekdays(locale));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // ─── Month derived ───

  const calendarDays = $derived(getCalendarDays(date, locale));
  const weekCount = $derived(Math.ceil(calendarDays.length / 7));

  // ─── Week derived ───

  const weekDays = $derived(getWeekDayDates(date, locale));
  const weekTitle = $derived(formatWeekTitle(date, locale));

  // ─── Day derived ───

  const dayTitle = $derived(format(date, 'EEEE, MMMM d', { locale }));
  const dayIsToday = $derived(isSameDay(date, new Date()));
  const dayViewEvents = $derived(getTimedEventsForDate(date));
  const dayViewLayout = $derived(computeEventLayout(dayViewEvents));

  // ─── Helpers: calendar grid generation ───

  /** @param {import('date-fns').Locale} loc */
  function getWeekdays(loc) {
    const s = startOfWeek(new Date(), { locale: loc });
    return Array.from({ length: 7 }, (_, i) =>
      format(addDays(s, i), 'EEEEEE', { locale: loc })
    );
  }

  /** @param {Date} d @param {import('date-fns').Locale} loc */
  function getCalendarDays(d, loc) {
    const monthStart = startOfMonth(d);
    const monthEnd = endOfMonth(d);
    const calStart = startOfWeek(monthStart, { locale: loc });
    const calEnd = endOfWeek(monthEnd, { locale: loc });

    /** @type {Date[]} */
    const days = [];
    let cursor = calStart;
    while (isBefore(cursor, calEnd) || isSameDay(cursor, calEnd)) {
      days.push(cursor);
      cursor = addDays(cursor, 1);
    }
    return days;
  }

  /** @param {Date} d @param {import('date-fns').Locale} loc */
  function getWeekDayDates(d, loc) {
    const ws = startOfWeek(d, { locale: loc });
    return Array.from({ length: 7 }, (_, i) => addDays(ws, i));
  }

  /** @param {Date} d @param {import('date-fns').Locale} loc */
  function formatWeekTitle(d, loc) {
    const ws = startOfWeek(d, { locale: loc });
    const we = endOfWeek(d, { locale: loc });
    if (ws.getMonth() === we.getMonth()) {
      return `${format(ws, 'MMM d', { locale: loc })} – ${format(we, 'd, yyyy', { locale: loc })}`;
    }
    return `${format(ws, 'MMM d', { locale: loc })} – ${format(we, 'MMM d, yyyy', { locale: loc })}`;
  }

  // ─── Helpers: event filtering ───

  /** @param {CalendarEvent} ev @param {Date} day */
  function isEventOnDate(ev, day) {
    if (!ev.end) return isSameDay(ev.start, day);
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    return ev.start <= dayEnd && ev.end >= dayStart;
  }

  /** @param {Date} day */
  function getEventsForDate(day) {
    return events.filter(ev => isEventOnDate(ev, day));
  }

  /** @param {Date} day — timed (non-allDay) events starting on this day */
  function getTimedEventsForDate(day) {
    return events.filter(ev =>
      !ev.allDay && isSameDay(ev.start, day)
    );
  }

  // ─── Helpers: week/day event positioning ───

  /** @param {CalendarEvent} ev */
  function getEventTopHours(ev) {
    return ev.start.getHours() + ev.start.getMinutes() / 60;
  }

  /** @param {CalendarEvent} ev */
  function getEventDurationHours(ev) {
    if (!ev.end) return 1;
    const mins = (ev.end.getTime() - ev.start.getTime()) / 60000;
    return Math.max(mins / 60, 0.5); // min half-hour height
  }

  /**
   * Compute column layout for overlapping events within a single day.
   * Returns Map<id, { column: number, totalColumns: number }>
   * @param {CalendarEvent[]} dayEvents
   */
  function computeEventLayout(dayEvents) {
    /** @type {Map<string|number, { column: number, totalColumns: number }>} */
    const result = new Map();
    if (dayEvents.length === 0) return result;

    const sorted = [...dayEvents].sort((a, b) => a.start.getTime() - b.start.getTime());

    // Split into non-overlapping clusters
    /** @type {CalendarEvent[][]} */
    const clusters = [];
    let cluster = [sorted[0]];
    let clusterEnd = sorted[0].end || new Date(sorted[0].start.getTime() + 3600000);

    for (let i = 1; i < sorted.length; i++) {
      const ev = sorted[i];
      if (ev.start < clusterEnd) {
        cluster.push(ev);
        const evEnd = ev.end || new Date(ev.start.getTime() + 3600000);
        if (evEnd > clusterEnd) clusterEnd = evEnd;
      } else {
        clusters.push(cluster);
        cluster = [ev];
        clusterEnd = ev.end || new Date(ev.start.getTime() + 3600000);
      }
    }
    clusters.push(cluster);

    for (const group of clusters) {
      /** @type {Date[]} */
      const columns = [];
      for (const ev of group) {
        const evEnd = ev.end || new Date(ev.start.getTime() + 3600000);
        let col = columns.findIndex(colEnd => colEnd <= ev.start);
        if (col === -1) {
          col = columns.length;
          columns.push(evEnd);
        } else {
          columns[col] = evEnd;
        }
        result.set(ev.id, { column: col, totalColumns: 0 });
      }
      for (const ev of group) {
        const layout = result.get(ev.id);
        if (layout) layout.totalColumns = columns.length;
      }
    }

    return result;
  }

  // ─── Now indicator ───

  /** @returns {{ hours: number, isToday: boolean }} */
  function getNowPosition() {
    const now = new Date();
    return {
      hours: now.getHours() + now.getMinutes() / 60,
      isToday: true
    };
  }

  const nowPos = $derived(getNowPosition());

  // ─── Navigation ───

  function prev() {
    if (view === 'month') date = subMonths(date, 1);
    else if (view === 'week') date = subWeeks(date, 1);
    else date = addDays(date, -1);
  }

  function next() {
    if (view === 'month') date = addMonths(date, 1);
    else if (view === 'week') date = addWeeks(date, 1);
    else date = addDays(date, 1);
  }

  function goToday() {
    date = new Date();
  }

  /** @param {CalendarEvent} ev */
  function handleEventClick(ev) {
    oneventclick?.(ev);
  }

  /** @param {Date} d */
  function handleDateClick(d) {
    ondateclick?.(d);
  }
</script>

<div class="calendar {className}" {...rest}>
  <!-- ═══ Toolbar ═══ -->
  <!-- Toolbar buttons blur() on click to prevent stale focus rings when user presses keys afterward -->
  <div class="calendar-toolbar">
    <div class="calendar-toolbar-left">
      <button type="button" class="calendar-nav-btn" onclick={(e) => { prev(); /** @type {HTMLElement} */ (e.currentTarget).blur(); }} aria-label="Previous">
        <svg viewBox="0 0 256 256" aria-hidden="true">
          <polyline points="160,208 80,128 160,48" fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <button type="button" class="calendar-nav-btn" onclick={(e) => { next(); /** @type {HTMLElement} */ (e.currentTarget).blur(); }} aria-label="Next">
        <svg viewBox="0 0 256 256" aria-hidden="true">
          <polyline points="96,48 176,128 96,208" fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <button type="button" class="calendar-today-btn" onclick={(e) => { goToday(); /** @type {HTMLElement} */ (e.currentTarget).blur(); }}>Today</button>
      <h2 class="calendar-title">
        {#if view === 'month'}
          {format(date, 'LLLL yyyy', { locale })}
        {:else if view === 'week'}
          {weekTitle}
        {:else}
          {dayTitle}
        {/if}
      </h2>
    </div>
    <div class="calendar-toolbar-right">
      <div class="calendar-view-toggle" role="group" aria-label="Calendar view">
        <button
          type="button"
          class="calendar-toggle-btn"
          class:calendar-toggle-active={view === 'month'}
          onclick={(e) => { view = 'month'; /** @type {HTMLElement} */ (e.currentTarget).blur(); }}
        >Month</button>
        <button
          type="button"
          class="calendar-toggle-btn"
          class:calendar-toggle-active={view === 'week'}
          onclick={(e) => { view = 'week'; /** @type {HTMLElement} */ (e.currentTarget).blur(); }}
        >Week</button>
        <button
          type="button"
          class="calendar-toggle-btn"
          class:calendar-toggle-active={view === 'day'}
          onclick={(e) => { view = 'day'; /** @type {HTMLElement} */ (e.currentTarget).blur(); }}
        >Day</button>
      </div>
    </div>
  </div>

  <!-- ═══ Month View ═══ -->
  {#if view === 'month'}
    <div class="calendar-month" role="grid" aria-label="Calendar month view">
      <div class="calendar-weekday-row" role="row">
        {#each weekdays as day}
          <span class="calendar-weekday" role="columnheader">{day}</span>
        {/each}
      </div>

      <div
        class="calendar-month-grid"
        role="rowgroup"
        style="grid-template-rows: repeat({weekCount}, minmax(var(--calendar-cell-min-height), 1fr));"
      >
        {#each calendarDays as day}
          {@const isToday = isSameDay(day, new Date())}
          {@const isOutside = !isSameMonth(day, date)}
          {@const dayEvents = getEventsForDate(day)}
          {@const visibleEvents = dayEvents.slice(0, maxVisible)}
          {@const overflow = dayEvents.length - maxVisible}
          <div
            class="calendar-cell"
            class:calendar-cell-today={isToday}
            class:calendar-cell-outside={isOutside}
            role="gridcell"
            aria-label={format(day, 'EEEE, MMMM d', { locale })}
            onclick={() => handleDateClick(day)}
          >
            <span class="calendar-day-number" class:calendar-day-today={isToday}>
              {day.getDate()}
            </span>
            <div class="calendar-cell-events">
              {#each visibleEvents as ev (ev.id)}
                <button
                  type="button"
                  class="calendar-event-pill"
                  style="background: {ev.color || 'var(--calendar-event-default-bg)'}; color: {ev.color ? 'var(--color-text-on-accent)' : 'var(--calendar-event-default-text)'};"
                  onclick={(e) => { e.stopPropagation(); handleEventClick(ev); }}
                  title={ev.title}
                >
                  {#if eventSnippet}
                    {@render eventSnippet(ev)}
                  {:else}
                    <span class="calendar-event-pill-title">{ev.title}</span>
                  {/if}
                </button>
              {/each}
              {#if overflow > 0}
                <span class="calendar-overflow">+{overflow} more</span>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>

  <!-- ═══ Week View ═══ -->
  {:else if view === 'week'}
    <div class="calendar-week" role="grid" aria-label="Calendar week view">
      <!-- Weekday header row -->
      <div class="calendar-week-header">
        <div class="calendar-time-spacer"></div>
        {#each weekDays as day}
          {@const isToday = isSameDay(day, new Date())}
          <div class="calendar-week-day-header" class:calendar-week-day-today={isToday}>
            <span class="calendar-week-day-name">{format(day, 'EEE', { locale })}</span>
            <span class="calendar-week-day-num" class:calendar-week-day-num-today={isToday}>{day.getDate()}</span>
          </div>
        {/each}
      </div>

      <!-- Scrollable time grid -->
      <div class="calendar-week-body">
        <!-- Time gutter -->
        <div class="calendar-time-gutter">
          {#each hours as hour}
            <div class="calendar-time-label">
              {String(hour).padStart(2, '0')}:00
            </div>
          {/each}
        </div>

        <!-- Day columns -->
        {#each weekDays as day}
          {@const isToday = isSameDay(day, new Date())}
          {@const dayEvents = getTimedEventsForDate(day)}
          {@const layout = computeEventLayout(dayEvents)}
          <div class="calendar-day-column" onclick={() => handleDateClick(day)}>
            {#each hours as hour}
              <div class="calendar-hour-slot"></div>
            {/each}

            <!-- Now indicator -->
            {#if isToday}
              <div
                class="calendar-now-line"
                style="top: calc({nowPos.hours} * var(--calendar-slot-height));"
              >
                <div class="calendar-now-dot"></div>
              </div>
            {/if}

            <!-- Events -->
            {#each dayEvents as ev (ev.id)}
              {@const pos = layout.get(ev.id)}
              {@const top = getEventTopHours(ev)}
              {@const height = getEventDurationHours(ev)}
              <button
                type="button"
                class="calendar-event-block"
                style="
                  top: calc({top} * var(--calendar-slot-height));
                  height: calc({height} * var(--calendar-slot-height));
                  left: calc({pos ? pos.column / pos.totalColumns * 100 : 0}%);
                  width: calc({pos ? 100 / pos.totalColumns : 100}%);
                  background: {ev.color || 'var(--calendar-event-default-bg)'};
                  color: {ev.color ? 'var(--color-text-on-accent)' : 'var(--calendar-event-default-text)'};
                "
                onclick={(e) => { e.stopPropagation(); handleEventClick(ev); }}
                title="{ev.title} ({format(ev.start, 'HH:mm', { locale })}{ev.end ? ' – ' + format(ev.end, 'HH:mm', { locale }) : ''})"
              >
                {#if eventSnippet}
                  {@render eventSnippet(ev)}
                {:else}
                  <span class="calendar-event-time">{format(ev.start, 'HH:mm', { locale })}</span>
                  <span class="calendar-event-title">{ev.title}</span>
                {/if}
              </button>
            {/each}
          </div>
        {/each}
      </div>
    </div>

  <!-- ═══ Day View ═══ -->
  {:else}
    <div class="calendar-day-view" role="grid" aria-label="Calendar day view">
      <!-- Day header -->
      <div class="calendar-day-header">
        <div class="calendar-time-spacer"></div>
        <div class="calendar-day-header-cell" class:calendar-week-day-today={dayIsToday}>
          <span class="calendar-week-day-name">{format(date, 'EEEE', { locale })}</span>
          <span class="calendar-week-day-num" class:calendar-week-day-num-today={dayIsToday}>{date.getDate()}</span>
        </div>
      </div>

      <!-- Scrollable time grid -->
      <div class="calendar-day-body">
        <div class="calendar-time-gutter">
          {#each hours as hour}
            <div class="calendar-time-label">
              {String(hour).padStart(2, '0')}:00
            </div>
          {/each}
        </div>

        <div class="calendar-day-column" onclick={() => handleDateClick(date)}>
          {#each hours as hour}
            <div class="calendar-hour-slot"></div>
          {/each}

          {#if dayIsToday}
            <div
              class="calendar-now-line"
              style="top: calc({nowPos.hours} * var(--calendar-slot-height));"
            >
              <div class="calendar-now-dot"></div>
            </div>
          {/if}

          {#each dayViewEvents as ev (ev.id)}
            {@const pos = dayViewLayout.get(ev.id)}
            {@const top = getEventTopHours(ev)}
            {@const height = getEventDurationHours(ev)}
            <button
              type="button"
              class="calendar-event-block"
              style="
                top: calc({top} * var(--calendar-slot-height));
                height: calc({height} * var(--calendar-slot-height));
                left: calc({pos ? pos.column / pos.totalColumns * 100 : 0}%);
                width: calc({pos ? 100 / pos.totalColumns : 100}%);
                background: {ev.color || 'var(--calendar-event-default-bg)'};
                color: {ev.color ? 'var(--color-text-on-accent)' : 'var(--calendar-event-default-text)'};
              "
              onclick={(e) => { e.stopPropagation(); handleEventClick(ev); }}
              title="{ev.title} ({format(ev.start, 'HH:mm', { locale })}{ev.end ? ' – ' + format(ev.end, 'HH:mm', { locale }) : ''})"
            >
              {#if eventSnippet}
                {@render eventSnippet(ev)}
              {:else}
                <span class="calendar-event-time">{format(ev.start, 'HH:mm', { locale })}</span>
                <span class="calendar-event-title">{ev.title}</span>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  /* ═══ Container ═══ */
  .calendar {
    display: flex;
    flex-direction: column;
    background: var(--calendar-bg);
    border: var(--calendar-border);
    border-radius: var(--calendar-radius);
    padding: var(--calendar-padding);
    min-height: 0;
  }

  /* ═══ Toolbar ═══ */
  .calendar-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--calendar-toolbar-gap);
    margin-bottom: var(--calendar-padding);
    flex-wrap: wrap;
  }

  .calendar-toolbar-left {
    display: flex;
    align-items: center;
    gap: var(--calendar-toolbar-gap);
  }

  .calendar-toolbar-right {
    display: flex;
    align-items: center;
  }

  .calendar-title {
    font-family: var(--calendar-title-font);
    font-size: var(--calendar-title-size);
    font-weight: var(--calendar-title-weight);
    letter-spacing: var(--calendar-title-tracking);
    color: var(--calendar-title-color);
    margin: 0;
  }

  /* ─── Nav buttons ─── */
  .calendar-nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--calendar-nav-btn-size);
    height: var(--calendar-nav-btn-size);
    border: none;
    border-radius: var(--calendar-nav-btn-radius);
    background: transparent;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: background var(--duration-instant) var(--easing-default);
  }

  .calendar-nav-btn:hover {
    background: var(--calendar-nav-btn-hover-bg);
  }

  .calendar-nav-btn svg {
    width: var(--icon-size-xs);
    height: var(--icon-size-xs);
  }

  /* ─── Today button ─── */
  .calendar-today-btn {
    font-family: var(--calendar-toggle-font);
    font-size: var(--calendar-toggle-size);
    letter-spacing: var(--calendar-toggle-tracking);
    padding: var(--calendar-toggle-padding);
    border: var(--calendar-cell-border);
    border-radius: var(--calendar-toggle-radius);
    background: transparent;
    color: var(--calendar-toggle-color);
    cursor: pointer;
    transition: background var(--duration-instant) var(--easing-default);
  }

  .calendar-today-btn:hover {
    background: var(--calendar-toggle-hover-bg);
  }

  /* ─── View toggle ─── */
  .calendar-view-toggle {
    display: flex;
    border: var(--calendar-cell-border);
    border-radius: var(--calendar-toggle-radius);
    overflow: hidden;
  }

  .calendar-toggle-btn {
    font-family: var(--calendar-toggle-font);
    font-size: var(--calendar-toggle-size);
    letter-spacing: var(--calendar-toggle-tracking);
    padding: var(--calendar-toggle-padding);
    border: none;
    background: transparent;
    color: var(--calendar-toggle-color);
    cursor: pointer;
    transition: background var(--duration-instant) var(--easing-default),
                color var(--duration-instant) var(--easing-default);
  }

  .calendar-toggle-btn:hover:not(.calendar-toggle-active) {
    background: var(--calendar-toggle-hover-bg);
  }

  .calendar-toggle-active {
    background: var(--calendar-toggle-active-bg);
    color: var(--calendar-toggle-active-text);
  }

  /* ═══ Month View ═══ */
  .calendar-month {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  .calendar-weekday-row {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
  }

  .calendar-weekday {
    display: flex;
    align-items: center;
    justify-content: center;
    height: var(--calendar-weekday-height);
    font-family: var(--calendar-weekday-font);
    font-size: var(--calendar-weekday-size);
    letter-spacing: var(--calendar-weekday-tracking);
    color: var(--calendar-weekday-color);
    text-transform: uppercase;
  }

  .calendar-month-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    flex: 1;
    min-height: 0;
  }

  .calendar-cell {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xs);
    padding: var(--calendar-cell-padding);
    border-right: var(--calendar-cell-border);
    border-bottom: var(--calendar-cell-border);
    cursor: pointer;
    transition: background var(--duration-instant) var(--easing-default);
    overflow: hidden;
    min-height: 0;
  }

  .calendar-cell:hover {
    background: var(--calendar-cell-hover-bg);
  }

  .calendar-cell:nth-child(7n + 1) {
    border-left: var(--calendar-cell-border);
  }

  .calendar-cell:nth-child(-n + 7) {
    border-top: var(--calendar-cell-border);
  }

  .calendar-cell-today {
    background: var(--calendar-cell-today-bg);
  }

  .calendar-cell-outside {
    opacity: var(--calendar-day-outside-opacity);
  }

  /* ─── Day number ─── */
  .calendar-day-number {
    font-family: var(--calendar-day-font);
    font-size: var(--calendar-day-size);
    color: var(--calendar-day-color);
    line-height: 1;
    align-self: flex-end;
    padding: var(--space-2xs);
  }

  .calendar-day-today {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--calendar-day-today-size);
    height: var(--calendar-day-today-size);
    background: var(--calendar-day-today-bg);
    color: var(--calendar-day-today-text);
    border-radius: var(--radius-circle);
    font-weight: 600;
  }

  /* ─── Month event pills ─── */
  .calendar-cell-events {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xs);
    min-height: 0;
    overflow: hidden;
  }

  .calendar-event-pill {
    display: flex;
    align-items: center;
    gap: var(--space-2xs);
    padding: var(--calendar-event-padding);
    border: none;
    border-radius: var(--calendar-event-radius);
    cursor: pointer;
    text-align: left;
    width: 100%;
    min-height: 0;
    overflow: hidden;
    transition: opacity var(--duration-instant) var(--easing-default);
  }

  .calendar-event-pill:hover {
    opacity: 0.85;
  }

  .calendar-event-pill-title {
    font-family: var(--calendar-event-font);
    font-size: var(--calendar-event-size);
    font-weight: var(--calendar-event-weight);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  .calendar-overflow {
    font-family: var(--calendar-overflow-font);
    font-size: var(--calendar-overflow-size);
    color: var(--calendar-overflow-color);
    padding-left: var(--space-xs);
  }

  /* ═══ Week View ═══ */
  .calendar-week {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  .calendar-week-header {
    display: grid;
    grid-template-columns: var(--calendar-time-width) repeat(7, 1fr);
    border-bottom: var(--calendar-cell-border);
  }

  .calendar-time-spacer {
    width: var(--calendar-time-width);
  }

  .calendar-week-day-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2xs);
    padding: var(--space-xs) 0;
  }

  .calendar-week-day-name {
    font-family: var(--calendar-weekday-font);
    font-size: var(--calendar-weekday-size);
    letter-spacing: var(--calendar-weekday-tracking);
    color: var(--calendar-weekday-color);
    text-transform: uppercase;
  }

  .calendar-week-day-num {
    font-family: var(--calendar-day-font);
    font-size: var(--type-heading-lg-size);
    color: var(--calendar-day-color);
    line-height: 1;
  }

  .calendar-week-day-today .calendar-week-day-name {
    color: var(--color-accent);
  }

  .calendar-week-day-num-today {
    color: var(--color-accent);
  }

  .calendar-week-body {
    display: grid;
    grid-template-columns: var(--calendar-time-width) repeat(7, 1fr);
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }

  /* ─── Time gutter ─── */
  .calendar-time-gutter {
    position: relative;
  }

  .calendar-time-label {
    height: var(--calendar-slot-height);
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    padding-right: var(--space-sm);
    font-family: var(--calendar-time-font);
    font-size: var(--calendar-time-size);
    color: var(--calendar-time-color);
    transform: translateY(-50%);
  }

  .calendar-time-label:first-child {
    visibility: hidden;
  }

  /* ─── Day columns ─── */
  .calendar-day-column {
    position: relative;
    border-left: var(--calendar-cell-border);
    cursor: pointer;
  }

  .calendar-hour-slot {
    height: var(--calendar-slot-height);
    border-bottom: var(--calendar-slot-border);
  }

  /* ─── Now indicator ─── */
  .calendar-now-line {
    position: absolute;
    left: 0;
    right: 0;
    border-top: var(--calendar-now-width) solid var(--calendar-now-color);
    z-index: 2;
    pointer-events: none;
  }

  .calendar-now-dot {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translate(-50%, -50%);
    width: var(--space-sm);
    height: var(--space-sm);
    background: var(--calendar-now-color);
    border-radius: var(--radius-circle);
  }

  /* ─── Event blocks (week/day) ─── */
  .calendar-event-block {
    position: absolute;
    display: flex;
    flex-direction: column;
    gap: var(--space-2xs);
    padding: var(--calendar-event-padding);
    border-radius: var(--calendar-event-radius);
    border: none;
    cursor: pointer;
    text-align: left;
    overflow: hidden;
    z-index: 1;
    transition: opacity var(--duration-instant) var(--easing-default);
  }

  .calendar-event-block:hover {
    opacity: 0.85;
    z-index: 3;
  }

  .calendar-event-time {
    font-family: var(--calendar-event-font);
    font-size: var(--calendar-event-size);
    opacity: 0.8;
    white-space: nowrap;
  }

  .calendar-event-title {
    font-family: var(--calendar-event-font);
    font-size: var(--calendar-event-size);
    font-weight: var(--calendar-event-weight);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ═══ Day View ═══ */
  .calendar-day-view {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  .calendar-day-header {
    display: grid;
    grid-template-columns: var(--calendar-time-width) 1fr;
    border-bottom: var(--calendar-cell-border);
  }

  .calendar-day-header-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2xs);
    padding: var(--space-xs) 0;
  }

  .calendar-day-body {
    display: grid;
    grid-template-columns: var(--calendar-time-width) 1fr;
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }

  /* ═══ Focus ═══ */
  .calendar-nav-btn:focus-visible,
  .calendar-today-btn:focus-visible,
  .calendar-toggle-btn:focus-visible,
  .calendar-event-pill:focus-visible,
  .calendar-event-block:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  .calendar-nav-btn:focus:not(:focus-visible),
  .calendar-today-btn:focus:not(:focus-visible),
  .calendar-toggle-btn:focus:not(:focus-visible),
  .calendar-event-pill:focus:not(:focus-visible),
  .calendar-event-block:focus:not(:focus-visible) {
    outline: none;
  }

  /* ═══ Reduced motion ═══ */
  @media (prefers-reduced-motion: reduce) {
    .calendar-nav-btn,
    .calendar-today-btn,
    .calendar-toggle-btn,
    .calendar-cell,
    .calendar-event-pill,
    .calendar-event-block {
      transition: none;
    }
  }
</style>
