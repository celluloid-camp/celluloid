export interface Welcome2 {
  format: Format;
  streams: Stream[];
  chapters: any[];
}

export interface Format {
  size: number;
  tags: FormatTags;
  bit_rate: number;
  duration: number;
  nb_streams: number;
  start_time: number;
  format_name: string;
  nb_programs: number;
  probe_score: number;
  format_long_name: string;
}

export interface FormatTags {
  encoder: string;
  major_brand: string;
  minor_version: string;
  compatible_brands: string;
}

export interface Stream {
  id: string;
  tags: StreamTags;
  index: number;
  profile: string;
  bit_rate: number;
  channels: number;
  duration: number;
  codec_tag: string;
  nb_frames: number;
  start_pts: number;
  time_base: string;
  codec_name: string;
  codec_type: string;
  sample_fmt: string;
  start_time: number;
  disposition: { [key: string]: number };
  duration_ts: number;
  sample_rate: number;
  max_bit_rate: number;
  r_frame_rate: string;
  avg_frame_rate: string;
  channel_layout: string;
  nb_read_frames: string;
  bits_per_sample: number;
  codec_long_name: string;
  codec_time_base: string;
  nb_read_packets: string;
  codec_tag_string: string;
  bits_per_raw_sample: string;
}

export interface StreamTags {
  language: string;
  handler_name: string;
}
