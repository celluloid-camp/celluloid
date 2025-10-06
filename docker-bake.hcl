group "default" {
  targets = ["web", "worker"]
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
variable "NEXT_PUBLIC_POSTHOG_HOST" {
  default = "https://eu.i.posthog.com"
}

target "docker-metadata-action" {
  tags = ["web:latest"]
}


target "web" {
  inherits = ["docker-metadata-action"]
  context    = "."
  dockerfile = "./Dockerfile"
  target     = "web"
  tags = "${target.docker-metadata-action.tags}"
  cache-from = ["type=gha"]
  cache-to   = ["type=gha,mode=max"]
  args = {
    VERSION  = "${VERSION}"
    REVISION = "${REVISION}"
    NEXT_PUBLIC_POSTHOG_KEY = "${NEXT_PUBLIC_POSTHOG_KEY}"
    NEXT_PUBLIC_POSTHOG_HOST = "${NEXT_PUBLIC_POSTHOG_HOST}"
  }
  push = true
}

target "worker" {
  inherits = ["docker-metadata-action"]
  context    = "."
  dockerfile = "./Dockerfile"
  target     = "worker"
  tags = [for tag in target.docker-metadata-action.tags : replace(tag, "web", "worker")]
  cache-from = ["type=gha"]
  cache-to   = ["type=gha,mode=max"]
  args = {
    VERSION  = "${VERSION}"
    REVISION = "${REVISION}"
  }
  push = true
}
