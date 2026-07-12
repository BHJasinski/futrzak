const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", isOpen);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    });
  });
}

const schedule = {
  0: null,
  1: { open: "09:00", close: "14:00" },
  2: { open: "16:00", close: "20:00" },
  3: { open: "16:00", close: "20:00" },
  4: { open: "16:00", close: "20:00" },
  5: { open: "09:00", close: "14:00" },
  6: { open: "10:00", close: "13:00" }
};

function getWarsawParts() {
  const formatter = new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  const date = new Date();
  const parts = formatter.formatToParts(date);
  const weekdayText = parts.find((part) => part.type === "weekday")?.value.toLowerCase();
  const hour = Number(parts.find((part) => part.type === "hour")?.value || 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value || 0);

  const dayMap = {
    "niedz.": 0,
    "pon.": 1,
    "wt.": 2,
    "śr.": 3,
    "czw.": 4,
    "pt.": 5,
    "sob.": 6
  };

  return {
    day: dayMap[weekdayText] ?? new Date().getDay(),
    minutes: hour * 60 + minute
  };
}

function toMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function updateOpenStatus() {
  const { day, minutes } = getWarsawParts();
  const today = schedule[day];
  const status = document.getElementById("open-status");
  const todayHours = document.getElementById("today-hours");
  const miniStatus = document.getElementById("mini-status");
  const eyebrow = status?.closest(".eyebrow");

  document.querySelectorAll(".hours-list [data-day]").forEach((row) => {
    row.classList.toggle("today", Number(row.dataset.day) === day);
  });

  if (!today) {
    if (status) status.textContent = "Dzisiaj gabinet jest zamknięty";
    if (todayHours) todayHours.textContent = "Zamknięte";
    if (miniStatus) miniStatus.textContent = "Dzisiaj zamknięte";
    eyebrow?.classList.add("closed");
    miniStatus?.classList.add("closed");
    return;
  }

  const openMinutes = toMinutes(today.open);
  const closeMinutes = toMinutes(today.close);
  const isOpen = minutes >= openMinutes && minutes < closeMinutes;

  if (todayHours) {
    todayHours.textContent = `${today.open}–${today.close}`;
  }

  if (isOpen) {
    if (status) status.textContent = `Gabinet jest otwarty do ${today.close}`;
    if (miniStatus) miniStatus.textContent = `Otwarte do ${today.close}`;
    eyebrow?.classList.remove("closed");
    miniStatus?.classList.remove("closed");
  } else {
    if (status) status.textContent = `Dzisiaj przyjmujemy ${today.open}–${today.close}`;
    if (miniStatus) miniStatus.textContent = `Dzisiaj ${today.open}–${today.close}`;
    eyebrow?.classList.add("closed");
    miniStatus?.classList.add("closed");
  }
}

updateOpenStatus();
setInterval(updateOpenStatus, 60000);

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();
