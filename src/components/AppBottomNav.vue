<!-- <template>
  <ion-tab-bar slot="bottom">
    <ion-tab-button tab="home" href="/home">
      <ion-icon :icon="homeOutline" />

      <ion-label>Home</ion-label>
    </ion-tab-button>

    <ion-tab-button tab="debts" href="/debts">
      <ion-icon :icon="walletOutline" />

      <ion-label>Debts</ion-label>
    </ion-tab-button>

    <ion-tab-button tab="add" @click="handleAdd">
      <div class="add-button">
        <ion-icon :icon="add" />
      </div>

      <ion-label>Add</ion-label>
    </ion-tab-button>

    <ion-tab-button tab="more" href="/more">
      <ion-icon :icon="settingsOutline" />

      <ion-label>More</ion-label>
    </ion-tab-button>
  </ion-tab-bar>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonIcon, IonLabel } from "@ionic/vue";

import {
  homeOutline,
  walletOutline,
  add,
  settingsOutline,
} from "ionicons/icons";

const emit = defineEmits<{
  add: [];
}>();

function handleAdd(): void {
  emit("add");
}
</script>

<style scoped>
ion-tab-bar {
  height: 68px;

  /* ! Sage Finance theme */
  --background: var(--app-surface);

  border-top: 1px solid var(--app-border);

  /* ! Floating rounded navigation characteristic */
  border-radius: 24px 24px 0 0;
  overflow: hidden;

  /* ! Prevent content from appearing outside rounded corners */
  overflow: hidden;

  /* ! Separate the navigation from the page */
  box-shadow: 0 -4px 18px rgba(31, 41, 55, 0.06);
}

ion-tab-button {
  /* ! Default navigation state */
  --color: var(--app-text-muted);

  /* ! Active navigation state */
  --color-selected: var(--app-text);
}

ion-icon {
  font-size: 21px;
}

ion-label {
  margin-top: 3px;

  font-size: 11px;
  font-weight: 600;
}

/* ! Center Add button */
.add-button {
  width: 44px;
  height: 44px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 16px;

  background: var(--app-text);
  color: #ffffff;

  box-shadow: 0 4px 12px rgba(31, 41, 55, 0.18);
}

.add-button ion-icon {
  font-size: 23px;
}
</style> -->
