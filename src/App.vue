<template>
  <div class="app">
    <header class="app-header">
      <div class="app-header__inner">
        <RouterLink to="/" class="app-header__logo">Coast FIRE Calculator</RouterLink>
        <nav class="app-header__nav">
          <RouterLink to="/" class="app-header__nav-link">Calculator</RouterLink>
          <RouterLink to="/explainer" class="app-header__nav-link">How it works</RouterLink>
        </nav>
      </div>
    </header>
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style>
*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #1a1a2e;
  background: #f7f8fc;
}

a { color: inherit; }
</style>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: #1a1a2e;
  color: #fff;
  padding: 0 1.5rem;
}

.app-header__inner {
  max-width: 1100px;
  margin: 0 auto;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-header__logo {
  font-weight: 700;
  font-size: 1.1rem;
  text-decoration: none;
  color: #fff;
  letter-spacing: -0.01em;
}

.app-header__nav {
  display: flex;
  gap: 1.5rem;
}

.app-header__nav-link {
  text-decoration: none;
  color: rgba(255,255,255,0.75);
  font-size: 0.9rem;
  transition: color 0.15s;
}

.app-header__nav-link:hover,
.app-header__nav-link.router-link-active {
  color: #fff;
}

.app-main {
  flex: 1;
}
</style>
