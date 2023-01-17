function replaceString(original) {
  const aimNameString = original.match(/\({.+\|\|e\)/)?.[0] || ''
  const replaced = aimNameString ? original.replace(aimNameString, '') : original
  return replaced
    .replace('"."', '""')
    .replace('"js/"', '""')
    .replace('".js"', '""')
    .replace('"css/"', '""')
    .replace('".css"', '""')
}

const a = replaceString(
  '"js/"+({99:"set",443:"about",812:"visible",908:"example"}[e]||e)+"."+{81:"b7718a88",99:"ff2d337e",443:"3b2931b5",698:"7399a386",812:"2d4e4863",848:"8f719e34",908:"fc389f4f"}[e]+".js"'
)
