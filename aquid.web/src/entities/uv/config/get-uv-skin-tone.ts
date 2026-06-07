// Reference: https:// www.openuv.io/dashboard?tab=4

export const SKIN_TONES = [
  '#f1d1b1', // "Very fair skin, white; red or blond hair; light-colored eyes; freckles likely"
  '#e4b590', // "Fair skin, white; light eyes; light hair",
  '#cf9f7d', // "Fair skin, cream white; any eye or hair color (very common skin type)"
  '#b67851', // "Olive skin, typical Mediterranean Caucasian skin; dark brown hair; medium to heavy pigmentation"
  '#a15e2d', // "Brown skin, typical Middle Eastern skin; dark hair; rarely sun sensitive"
  '#513938', // "Black skin; rarely sun sensitive"
]

export function getUvSkinTone (skinTone: number) {
  // API Returns skin tone 1-6. Using 0-5 for indexing.
  if (skinTone > 5 || skinTone < 0) {
    return '#000000'
  }
  return SKIN_TONES[skinTone]
}
