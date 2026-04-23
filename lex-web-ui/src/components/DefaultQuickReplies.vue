<template>
  <div
    v-if="buttons.length"
    class="lex-default-quick-replies"
    role="group"
    aria-label="Quick replies"
  >
    <v-btn
      v-for="(btn, i) in buttons"
      :key="i"
      class="lex-quick-reply-btn"
      variant="outlined"
      rounded="xl"
      size="small"
      :disabled="isLexProcessing"
      @click="onClick(btn)"
    >
      {{ displayText(btn) }}
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'default-quick-replies',
  computed: {
    buttons() {
      const list = this.$store.state.config.ui.defaultQuickReplies;
      if (!list || !Array.isArray(list)) {
        return [];
      }
      return list.filter(
        (b) => b && (b.text || b.label) && (b.value !== undefined && b.value !== null),
      );
    },
    isLexProcessing() {
      return this.$store.state.lex.isProcessing;
    },
  },
  methods: {
    displayText(btn) {
      return btn.text || btn.label;
    },
    onClick(btn) {
      const value = btn.value || btn.text || btn.label;
      if (!value) return;
      this.$store.dispatch('postTextMessage', {
        type: this.$store.state.config.ui.hideButtonMessageBubble ? 'button' : 'human',
        text: value,
      });
    },
  },
};
</script>

<style scoped>
.lex-default-quick-replies {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 56px;
  z-index: 3;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 12px 8px 12px;
  background: #e8eef5;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  max-height: 140px;
  overflow-y: auto;
  box-sizing: border-box;
}
.lex-quick-reply-btn {
  text-transform: none;
  letter-spacing: 0.02em;
  font-weight: 500;
  border-color: #64b5f6 !important;
  color: #1565c0 !important;
  background: #fff !important;
}
</style>
