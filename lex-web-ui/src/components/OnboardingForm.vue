<template>
  <div
    class="onboarding-wrap"
    role="dialog"
    aria-modal="true"
    aria-labelledby="onboarding-welcome-title"
  >
    <v-card
      class="onboarding-card mx-auto"
      :max-width="480"
      rounded="xl"
      elevation="4"
    >
      <v-btn
        icon
        variant="text"
        class="onboarding-close"
        aria-label="Close"
        @click="$emit('close')"
      >
        <v-icon>close</v-icon>
      </v-btn>

      <v-card-text class="pt-6 pb-2 px-6 text-center">
        <v-avatar
          v-if="avatarUrl"
          :size="88"
          class="onboarding-avatar mb-3"
        >
          <v-img :src="avatarUrl" cover alt="" />
        </v-avatar>
        <v-avatar
          v-else
          :size="88"
          :color="primaryColor"
          class="onboarding-avatar mb-3"
        >
          <v-icon size="48" color="white">local_florist</v-icon>
        </v-avatar>

        <h1 id="onboarding-welcome-title" class="onboarding-welcome text-h4 mb-1">
          {{ welcomeTitle }}
        </h1>
        <p class="onboarding-sub text-body-1 text-medium-emphasis mb-6">
          {{ welcomeSubtitle }}
        </p>

        <v-form ref="form" @submit.prevent="onSubmit">
          <v-text-field
            v-model="firstName"
            :label="firstNameLabel"
            :rules="[rules.required]"
            variant="outlined"
            density="comfortable"
            class="mb-2"
            autocomplete="given-name"
          />
          <v-text-field
            v-model="lastName"
            :label="lastNameLabel"
            :rules="[rules.required]"
            variant="outlined"
            density="comfortable"
            class="mb-2"
            autocomplete="family-name"
          />
          <v-text-field
            v-model="email"
            :label="emailLabel"
            type="email"
            variant="outlined"
            density="comfortable"
            class="mb-2"
            autocomplete="email"
          />

          <div class="onboarding-terms text-body-2 text-left mb-4">
            <v-checkbox
              v-model="termsAccepted"
              hide-details
              density="comfortable"
              :rules="[rules.termsRequired]"
            >
              <template #label>
                <span>
                  {{ termsBeforeLink }}
                  <a
                    :href="termsUrl"
                    class="onboarding-terms-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    @click.stop
                  >{{ termsLinkText }}</a>
                  {{ termsAfterLink }}
                </span>
              </template>
            </v-checkbox>
          </div>

          <v-btn
            type="submit"
            block
            size="x-large"
            class="onboarding-cta"
            :color="primaryColor"
            :loading="submitting"
          >
            {{ startButtonText }}
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'onboarding-form',
  emits: ['close', 'complete'],
  data() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      termsAccepted: false,
      submitting: false,
      rules: {
        required: (v) => !!(v && String(v).trim()) || 'This field is required',
        termsRequired: (v) => v === true || 'You must accept the terms to continue',
      },
    };
  },
  computed: {
    c() {
      return this.$store.state.config.ui;
    },
    welcomeTitle() {
      return this.c.onboardingWelcomeTitle || 'Welcome!';
    },
    welcomeSubtitle() {
      return this.c.onboardingWelcomeSubtitle || 'Please fill out information below!';
    },
    firstNameLabel() {
      return this.c.onboardingFirstNameLabel || 'First Name (Required)';
    },
    lastNameLabel() {
      return this.c.onboardingLastNameLabel || 'Last Name (Required)';
    },
    emailLabel() {
      return this.c.onboardingEmailLabel || 'Email (Optional)';
    },
    termsUrl() {
      return this.c.onboardingTermsUrl || '#';
    },
    termsLinkText() {
      return this.c.onboardingTermsLinkText || 'Terms and services';
    },
    termsBeforeLink() {
      return this.c.onboardingTermsBeforeLink
        || 'I have read and agree to the ';
    },
    termsAfterLink() {
      return this.c.onboardingTermsAfterLink
        || ' in regards to the use of personal information in this chat bot.';
    },
    startButtonText() {
      return this.c.onboardingStartButtonText || 'Start Chatting';
    },
    primaryColor() {
      return this.c.onboardingPrimaryColor || '#1e3a5f';
    },
    avatarUrl() {
      return this.c.onboardingAgentAvatarUrl || '';
    },
  },
  methods: {
    async onSubmit() {
      const { valid } = await this.$refs.form.validate();
      if (!valid) return;
      this.submitting = true;
      this.$emit('complete', {
        firstName: this.firstName.trim(),
        lastName: this.lastName.trim(),
        email: this.email.trim(),
        termsAccepted: this.termsAccepted,
      });
      this.submitting = false;
    },
  },
};
</script>

<style scoped>
.onboarding-wrap {
  position: fixed;
  z-index: 2000;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eceff1;
  padding: 16px;
  box-sizing: border-box;
}
.onboarding-card {
  position: relative;
  background: #fafafa !important;
}
.onboarding-close {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 2;
}
.onboarding-welcome {
  color: #1e3a5f;
  font-weight: 600;
}
.onboarding-terms-link {
  color: #1565c0;
  text-decoration: underline;
  font-weight: 500;
}
.onboarding-cta {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.02em;
}
</style>
