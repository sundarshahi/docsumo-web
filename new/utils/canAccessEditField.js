export default function canAccessEditField(userConfig) {
  return userConfig?.flags?.flagElement?.allowEditFields ?? true;
}
