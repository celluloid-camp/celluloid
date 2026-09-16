"use client";

import LinkIcon from "@mui/icons-material/Link";
import SearchIcon from "@mui/icons-material/Search";
import { Box } from "@mui/material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

const createOptions = [
  {
    href: "/create/link",
    labelKey: "importFromLink" as const,
    descriptionKey: "importFromLinkDescription" as const,
    icon: LinkIcon,
  },
  {
    href: "/create/search",
    labelKey: "searchPeertube" as const,
    descriptionKey: "searchPeertubeDescription" as const,
    icon: SearchIcon,
  },
] as const;

export function CreateLayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("project");
  const tCreate = useTranslations("project.create");

  const hasSearchResults =
    pathname.startsWith("/create/search") &&
    (searchParams.get("q")?.trim().length ?? 0) > 0;

  const isActive = (href: string) =>
    href === "/create/link"
      ? pathname === "/create" || pathname.startsWith("/create/link")
      : pathname.startsWith(href);

  return (
    <Box
      className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-8 sm:py-14"
      sx={{
        background:
          "linear-gradient(180deg, #FFE7DB 0%, #FFF1E9 38%, #F9FAFC 100%)",
      }}
    >
      <Box
        aria-hidden
        className="pointer-events-none absolute inset-0"
        sx={{
          background:
            "radial-gradient(60% 45% at 85% 0%, rgba(85,124,255,0.12) 0%, rgba(85,124,255,0) 60%), radial-gradient(50% 40% at 0% 10%, rgba(255,107,104,0.10) 0%, rgba(255,107,104,0) 55%)",
        }}
      />

      <Box className="relative mx-auto max-w-7xl">
        <Box className="mb-8 px-1 sm:mb-10">
          <Box
            component="h1"
            className="text-4xl leading-[1.05] text-[#121828] sm:text-5xl"
            sx={{ fontFamily: "var(--font-serif)" }}
          >
            {t("createTitle")}
          </Box>
        </Box>

        <Box className="overflow-hidden rounded-[28px] border border-black/6 bg-white/95 backdrop-blur">
          <Box className="flex min-h-[560px] flex-col md:h-[calc(100dvh-14rem)] md:min-h-0 md:flex-row">
            {hasSearchResults ? null : (
              <Box className="shrink-0 border-black/6 border-b bg-[#FBFBFD] p-4 md:w-[300px] md:overflow-y-auto md:border-r md:border-b-0 md:p-5">
                <Box className="flex gap-2 md:flex-col">
                  {createOptions.map(
                    ({ href, labelKey, descriptionKey, icon: Icon }) => {
                      const active = isActive(href);
                      return (
                        <button
                          key={href}
                          type="button"
                          onClick={() => router.push(href)}
                          aria-current={active ? "page" : undefined}
                          className={`group relative flex flex-1 items-start gap-3 rounded-2xl border px-3.5 py-3 text-left transition-all duration-200 md:flex-none ${
                            active
                              ? "border-primary bg-primary/8 ring-1 ring-primary/20"
                              : "border-black/6 bg-white hover:border-primary/40 hover:bg-primary/4"
                          }`}
                        >
                          <Box
                            className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 ${
                              active
                                ? "bg-primary text-white"
                                : "bg-black/4 text-[#65748B] group-hover:bg-primary/10 group-hover:text-primary"
                            }`}
                          >
                            <Icon fontSize="small" />
                          </Box>
                          <Box className="min-w-0">
                            <Box
                              className={`text-sm font-semibold ${
                                active ? "text-primary" : "text-[#121828]"
                              }`}
                            >
                              {tCreate(labelKey)}
                            </Box>
                            <Box className="mt-0.5 hidden text-xs leading-snug text-[#65748B] md:block">
                              {tCreate(descriptionKey)}
                            </Box>
                          </Box>
                        </button>
                      );
                    },
                  )}
                </Box>
              </Box>
            )}

            <Box className="min-w-0 flex-1 overflow-y-auto p-6 sm:p-8 md:p-9">
              {children}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
