if (process.env.NEXT_RUNTIME === "nodejs") {
  import("workflow/runtime").then(async ({ getWorld }) => {
    console.log("Calling world.start()");
    const world = await getWorld();
    await world.start?.();
  });
}
