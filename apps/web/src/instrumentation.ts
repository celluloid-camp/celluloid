if (process.env.NEXT_RUNTIME === "nodejs") {
  import("workflow/runtime").then(async ({ getWorld }) => {
    console.log("Calling world.start()");
    await getWorld().start?.();
  });
}
