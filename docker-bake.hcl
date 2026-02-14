group "default" {
  targets = ["web"]
}

variable "VERSION" {
  default = "dev"
}
variable "REVISION" {
  default = "dev"
}

variable "NEXT_PUBLIC_POSTHOG_KEY" {
  default = "xxx"
}

variable "NEXT_PUBLIC_KNOCK_API_KEY" {
  default = "xxx"
}

variable "NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID" {
  default = "xxx"
}

variable "STAGE" {
  default = "dev"
}
target "docker-metadata-action" {
  tags = ["web:latest"]
}


target "web" {
  inherits = ["docker-metadata-action"]
  context    = "."
  dockerfile = "./Dockerfile"
  target     = "runner"
  tags = "${target.docker-metadata-action.tags}"
  cache-from = ["type=gha"]
  cache-to   = ["type=gha,mode=max"]
  args = {
    VERSION  = "${VERSION}"
    REVISION = "${REVISION}"
    NEXT_PUBLIC_POSTHOG_KEY = "${NEXT_PUBLIC_POSTHOG_KEY}"
    NEXT_PUBLIC_KNOCK_API_KEY = "${NEXT_PUBLIC_KNOCK_API_KEY}"
    NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID = "${NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID}"
    STAGE = "${STAGE}"
  }
  push = true
}
