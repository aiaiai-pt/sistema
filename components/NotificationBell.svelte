<!--
  @component NotificationBell

  Bell icon button with unread badge, opening a dropdown of notifications.
  Composes Button (ghost, iconOnly), Badge, Menu, and EmptyState.

  Consumes --notification-* tokens from components.css.

  @example
  <NotificationBell
    notifications={[
      { id: '1', message: 'Maintenance started', eventType: 'maintenance_started', createdAt: '2026-04-16T10:00:00Z' },
    ]}
    unreadCount={3}
    onmarkread={(id) => markAsRead(id)}
    onmarkallread={() => markAllAsRead()}
  />
-->
<script>
  import Button from './Button.svelte';
  import Badge from './Badge.svelte';
  import EmptyState from './EmptyState.svelte';
  import Popover from './Popover.svelte';

  /**
   * @typedef {{ id: string; message: string; eventType: string; entityType?: string; entityId?: string; createdAt?: string; read?: boolean }} Notification
   */

  let {
    /** @type {Notification[]} */
    notifications = [],
    /** @type {number} */
    unreadCount = 0,
    /** @type {((id: string) => void) | undefined} */
    onmarkread = undefined,
    /** @type {(() => void) | undefined} */
    onmarkallread = undefined,
    /** @type {((notification: Notification) => void) | undefined} */
    onclick = undefined,
    /** @type {string} */
    class: className = '',
    ...rest
  } = $props();

  let open = $state(false);
  /** @type {HTMLElement | undefined} */
  let anchorRef = $state(undefined);

  /** @type {Record<string, string>} */
  const eventIcons = {
    maintenance_started: 'play',
    maintenance_completed: 'check-fat',
    inspection_completed: 'clipboard-text',
    reservation_approved: 'thumbs-up',
    reservation_rejected: 'thumbs-down',
  };

  /** @type {Record<string, string>} */
  const eventColors = {
    maintenance_started: 'var(--color-info)',
    maintenance_completed: 'var(--color-success)',
    inspection_completed: 'var(--color-success)',
    reservation_approved: 'var(--color-success)',
    reservation_rejected: 'var(--color-destructive)',
  };

  /**
   * @param {string | undefined} iso
   * @returns {string}
   */
  function formatTime(iso) {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      return `${days}d ago`;
    } catch {
      return '';
    }
  }

  function handleItemClick(notification) {
    if (!notification.read && onmarkread) {
      onmarkread(notification.id);
    }
    if (onclick) {
      onclick(notification);
    }
  }
</script>

<div class="notification-bell {className}" {...rest}>
  <div class="notification-bell-trigger">
    <Button
      variant="ghost"
      size="md"
      iconOnly
      aria-label="Notifications"
      bind:ref={anchorRef}
      onclick={() => { open = !open; }}
    >
      {#snippet icon()}
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
          <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"/>
        </svg>
      {/snippet}
    </Button>

    {#if unreadCount > 0}
      <div class="notification-bell-badge">
        <Badge variant="error">
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      </div>
    {/if}
  </div>

  <Popover bind:open anchor={anchorRef} placement="bottom-end">
    <div class="notification-panel" role="region" aria-label="Notifications">
      <div class="notification-header">
        <span class="notification-title">Notifications</span>
        {#if unreadCount > 0 && onmarkallread}
          <button class="notification-mark-all" onclick={onmarkallread}>
            Mark all read
          </button>
        {/if}
      </div>

      {#if notifications.length === 0}
        <div class="notification-empty">
          <EmptyState heading="No notifications" body="You're all caught up" />
        </div>
      {:else}
        <div class="notification-list">
          {#each notifications as notification (notification.id)}
            <button
              class="notification-item"
              class:notification-item--unread={!notification.read}
              onclick={() => handleItemClick(notification)}
            >
              <div
                class="notification-item-dot"
                style:background={!notification.read
                  ? (eventColors[notification.eventType] || 'var(--color-info)')
                  : 'transparent'}
              ></div>
              <div class="notification-item-body">
                <span class="notification-item-message">{notification.message}</span>
                <span class="notification-item-time">{formatTime(notification.createdAt)}</span>
              </div>
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </Popover>
</div>

<style>
  .notification-bell {
    position: relative;
    display: inline-flex;
  }

  .notification-bell-trigger {
    position: relative;
  }

  .notification-bell-badge {
    position: absolute;
    top: -2px;
    right: -2px;
    pointer-events: none;
  }

  .notification-panel {
    width: var(--notification-panel-width, 360px);
    max-height: var(--notification-panel-max-height, 420px);
    display: flex;
    flex-direction: column;
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .notification-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-md) var(--space-lg);
    border-bottom: var(--elevation-border);
  }

  .notification-title {
    font-family: var(--type-heading-font);
    font-size: var(--type-body-sm-size);
    font-weight: 600;
    color: var(--color-text);
  }

  .notification-mark-all {
    all: unset;
    cursor: pointer;
    font-family: var(--type-label-font);
    font-size: var(--type-label-size);
    letter-spacing: var(--type-label-tracking);
    color: var(--color-accent);
    transition: opacity var(--duration-instant) var(--easing-default);
  }

  .notification-mark-all:hover {
    opacity: 0.8;
  }

  .notification-mark-all:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  .notification-empty {
    padding: var(--space-2xl) var(--space-lg);
  }

  .notification-list {
    overflow-y: auto;
    flex: 1;
  }

  .notification-item {
    all: unset;
    cursor: pointer;
    display: flex;
    align-items: flex-start;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-lg);
    width: 100%;
    box-sizing: border-box;
    transition: background var(--duration-instant) var(--easing-default);
  }

  .notification-item:hover {
    background: var(--color-surface-secondary);
  }

  .notification-item:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: calc(-1 * var(--focus-ring-width));
  }

  .notification-item--unread {
    background: var(--color-surface);
  }

  .notification-item-dot {
    width: 8px;
    height: 8px;
    border-radius: var(--radius-pill);
    flex-shrink: 0;
    margin-top: 6px;
  }

  .notification-item-body {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xs);
    flex: 1;
    min-width: 0;
  }

  .notification-item-message {
    font-family: var(--type-body-sm-font);
    font-size: var(--type-body-sm-size);
    color: var(--color-text);
    line-height: 1.4;
  }

  .notification-item--unread .notification-item-message {
    font-weight: 600;
  }

  .notification-item-time {
    font-family: var(--type-label-font);
    font-size: var(--type-label-size);
    color: var(--color-text-muted);
  }
</style>
