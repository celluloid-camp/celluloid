import dayjs from "dayjs";

import duration from "dayjs/plugin/duration";
import isLeapYear from "dayjs/plugin/isLeapYear"; // import plugin
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";

dayjs.locale("fr-fr"); // use locale
dayjs.extend(relativeTime);
dayjs.extend(isLeapYear); // use plugin
dayjs.extend(duration);

const day = dayjs;
export default day;
