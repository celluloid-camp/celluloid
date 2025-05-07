export function formatDuration(duration: number) {
  const seconds = Math.floor(duration % 60);
  const minutes = Math.floor(duration / 60) % 60;
  const hours = Math.floor(duration / 3600);
  const strSeconds = seconds >= 10 ? `${seconds}` : `0${seconds}`;
  const strMinutes = minutes >= 10 ? `${minutes}` : `0${minutes}`;
  const formatted = `${strMinutes}:${strSeconds}`;
  if (hours) {
    return `${hours}:${formatted}`;
  }
  return formatted;
}
