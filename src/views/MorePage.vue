<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>More</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="page-container">
        <h1>More</h1>

        <div class="settings-card">
          <strong>Settings</strong>
          <p>Manage your Debt Tracker preferences.</p>
        </div>

        <div class="settings-card">
          <strong>Data</strong>
          <p>Manage your locally stored debt data.</p>
        </div>

        <div class="settings-card">
          <strong>About</strong>
          <p>Debt Tracker MVP</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from "@ionic/vue";
</script>

<style scoped>
.page-container {
  padding: 24px 16px 100px;
}

.settings-card {
  padding: 18px;
  margin-bottom: 12px;
  border-radius: 18px;
  background: white;
  border: 1px solid #eee;
}

.settings-card p {
  margin: 5px 0 0;
  color: #888;
  font-size: 13px;
}
</style>
