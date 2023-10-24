interface Subtitle {
  startTime: number;
  endTime: number;
  text: string;
}

export function toSrt(json: Subtitle[]): string {
  let srt = '';

  json.forEach((subtitle: Subtitle, index: number) => {
    const { startTime, endTime, text } = subtitle;

    // Format the start and end time in HH:MM:SS,mmm format
    const formattedStartTime = formatTime(startTime);
    const formattedEndTime = formatTime(endTime);

    // Add the subtitle index, start and end time, and text to the SRT format
    srt += `${index + 1}\n${formattedStartTime} --> ${formattedEndTime}\n${text}\n\n`;
  });

  return srt;
}

function formatTime(time: number): string {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor(time % 60);
  const milliseconds = Math.round((time % 1) * 1000);

  return `${padNumber(hours)}:${padNumber(minutes)}:${padNumber(seconds)},${padNumber(milliseconds, 3)}`;
}

function padNumber(number: number, length = 2): string {
  return number.toString().padStart(length, '0');
}
