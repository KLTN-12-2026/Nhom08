/**
 * Group scheduling ("lịch chung") helpers.
 *
 * Flow:
 *  1. The host defines the places and time windows they can attend (`host_options`) and shares the plan link.
 *  2. A guest opens the link, ticks the time windows they can attend, ticks the host's places they like
 *     and may suggest extra places.
 *  3. The response is sent to the server (`RepositoryManager.planInvites`) so it reaches the host automatically.
 *     If the server endpoints are not available yet, the guest gets an encoded response link as a fallback.
 *  4. The host dashboard pulls responses (or imports fallback links), computes overlaps, and asks the AI
 *     to produce the final itinerary.
 */
import dayjs from "dayjs";
import RepositoryManager from "../../data/repositoryManager";

/* ----------------------------- Types ----------------------------- */

export interface TimeSlot {
  /** YYYY-MM-DD */
  date: string;
  /** HH:mm */
  start: string;
  /** HH:mm */
  end: string;
}

export interface PlaceRef {
  name: string;
  place_id?: number;
  address?: string;
  /** true when a guest suggested a place that is not in the host's list */
  is_new?: boolean;
}

export interface HostOptions {
  places: PlaceRef[];
  slots: TimeSlot[];
}

export interface GuestResponse {
  /** Stable per guest-device + name, so re-submitting replaces the previous response */
  id: string;
  name: string;
  phone?: string;
  isVegetarian: boolean;
  note?: string;
  /** Host time windows this guest can attend */
  slots: TimeSlot[];
  /** Places this guest prefers (host's places they ticked + their own suggestions) */
  places: PlaceRef[];
  /** ISO timestamp */
  submittedAt: string;
}

export interface PlanMetaStop {
  time: string;
  place_name: string;
  address: string;
  estimated_cost?: string;
}

export interface PlanMeta {
  id: string;
  summary: string;
  /** DD/MM/YYYY */
  date: string;
  participants: number;
  meeting_type?: string;
  meeting_vibe?: string;
  schedule: PlanMetaStop[];
  host_options?: HostOptions;
}

export interface ResponsePayload {
  v: 2;
  plan: PlanMeta;
  response: GuestResponse;
}

export interface FinalStop {
  time: string;
  activity_type: string;
  place_name: string;
  address: string;
  estimated_cost: string;
  vegetarian_friendly: boolean;
  vegetarian_status: string;
  why_suitable: string;
  pros: string[];
  cons: string[];
}

export interface MergedPlanResult {
  summary: string;
  chosen: {
    /** DD/MM/YYYY */
    date: string;
    start: string;
    end: string;
    reason: string;
    attendees_available: string[];
    attendees_unavailable: string[];
  };
  final_schedule: FinalStop[];
  alternatives: { date: string; time: string; place_name: string; attendees: string[]; note: string }[];
  attendee_fit: { name: string; status: "fit" | "partial" | "no_fit"; note: string }[];
  conflicts: string[];
  general_advice: string;
  /** true when the result was produced locally because the AI call failed */
  isFallback?: boolean;
}

export interface CandidateSlot {
  /** YYYY-MM-DD */
  date: string;
  start: string;
  end: string;
  attendeeIds: string[];
  attendeeNames: string[];
  places: { name: string; votes: number; is_new?: boolean }[];
}

export interface CoordinationData {
  plan: PlanMeta;
  responses: GuestResponse[];
  result?: MergedPlanResult;
  analyzedAt?: string;
}

export const MAX_EXTRA_PLACES = 10;
export const MAX_HOST_PLACES = 6;
export const MAX_HOST_SLOTS = 6;

/* ------------------------- Encoding helpers ------------------------- */

export const encodePayload = (obj: unknown): string =>
  encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(obj)))));

export const decodePayload = <T = any>(raw: string): T => {
  let value = raw.trim();
  // Accept a full URL pasted by the host
  if (/^https?:\/\//i.test(value) || value.includes("?r=")) {
    const query = value.includes("?") ? value.slice(value.indexOf("?") + 1) : value;
    const r = new URLSearchParams(query).get("r");
    if (r) value = r;
  }
  let b64 = value;
  try {
    b64 = decodeURIComponent(value);
  } catch (e) {
    /* already decoded */
  }
  return JSON.parse(decodeURIComponent(escape(atob(b64))));
};

export const buildResponseUrl = (payload: ResponsePayload): string =>
  `${window.location.origin}/plans/responses?r=${encodePayload(payload)}`;

/* ------------------------- Time helpers ------------------------- */

export const toMinutes = (hhmm: string): number => {
  const [h, m] = (hhmm || "0:0").split(":").map((n) => parseInt(n, 10));
  return (h || 0) * 60 + (m || 0);
};

const fmtMinutes = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

/** Parse DD/MM/YYYY into a dayjs object (null if invalid) */
export const parseDMY = (value?: string): dayjs.Dayjs | null => {
  if (!value) return null;
  const m = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const d = dayjs(`${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`);
  return d.isValid() ? d : null;
};

export const formatDateDisplay = (isoDate: string): string => {
  const d = dayjs(isoDate);
  return d.isValid() ? d.format("DD/MM/YYYY") : isoDate;
};

/** Extract "HH:mm - HH:mm" from free text such as "18:30 - 20:30" */
export const parseTimeRange = (text?: string): { start: string; end: string } | null => {
  const m = (text || "").match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const start = `${m[1].padStart(2, "0")}:${m[2]}`;
  const end = `${m[3].padStart(2, "0")}:${m[4]}`;
  return toMinutes(end) > toMinutes(start) ? { start, end } : null;
};

export const slotKey = (s: TimeSlot) => `${s.date}|${s.start}|${s.end}`;

const normalizeName = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

/* ------------------------- Host options ------------------------- */

/**
 * Host options for a plan. Plans shared before this feature existed have none,
 * so derive sensible defaults from the plan's own itinerary.
 */
export const deriveHostOptions = (plan: { date?: string; schedule?: { time?: string; place_name?: string; address?: string }[]; host_options?: HostOptions }): HostOptions => {
  if (plan?.host_options && (plan.host_options.places?.length || plan.host_options.slots?.length)) {
    return {
      places: plan.host_options.places || [],
      slots: plan.host_options.slots || [],
    };
  }
  const places: PlaceRef[] = [];
  const seen = new Set<string>();
  (plan?.schedule || []).forEach((s) => {
    if (s.place_name && !seen.has(normalizeName(s.place_name))) {
      seen.add(normalizeName(s.place_name));
      places.push({ name: s.place_name, address: s.address });
    }
  });

  const day = parseDMY(plan?.date) || dayjs().add(1, "day");
  const date = day.format("YYYY-MM-DD");
  let min = Infinity;
  let max = -Infinity;
  (plan?.schedule || []).forEach((s) => {
    const r = parseTimeRange(s.time);
    if (r) {
      min = Math.min(min, toMinutes(r.start));
      max = Math.max(max, toMinutes(r.end));
    }
  });
  const slots: TimeSlot[] =
    min < max ? [{ date, start: fmtMinutes(min), end: fmtMinutes(max) }] : [{ date, start: "18:30", end: "22:00" }];
  return { places, slots };
};

/* ------------------------- Guest profile (remembered) ------------------------- */

export interface GuestProfile {
  name: string;
  phone: string;
}

export const loadGuestProfile = (): GuestProfile | null => {
  try {
    const raw = localStorage.getItem("trove_guest_profile");
    return raw ? (JSON.parse(raw) as GuestProfile) : null;
  } catch (e) {
    return null;
  }
};

export const saveGuestProfile = (profile: GuestProfile) => {
  localStorage.setItem("trove_guest_profile", JSON.stringify(profile));
};

/** Normalises Vietnamese phone numbers. Returns null when the number looks invalid. */
export const normalizePhone = (raw: string): string | null => {
  const cleaned = raw.replace(/[\s.\-()]/g, "");
  if (!cleaned) return "";
  const local = cleaned.startsWith("+84") ? `0${cleaned.slice(3)}` : cleaned.startsWith("84") && cleaned.length >= 11 ? `0${cleaned.slice(2)}` : cleaned;
  return /^0\d{9}$/.test(local) ? local : null;
};

/* ------------------------- Storage ------------------------- */

const COORD_PREFIX = "trove_coord_";

export const loadCoordination = (planId: string): CoordinationData | null => {
  try {
    const raw = localStorage.getItem(`${COORD_PREFIX}${planId}`);
    return raw ? (JSON.parse(raw) as CoordinationData) : null;
  } catch (e) {
    return null;
  }
};

export const saveCoordination = (data: CoordinationData) => {
  localStorage.setItem(`${COORD_PREFIX}${data.plan.id}`, JSON.stringify(data));
};

export const listCoordinations = (): CoordinationData[] => {
  const list: CoordinationData[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(COORD_PREFIX)) {
      try {
        const parsed = JSON.parse(localStorage.getItem(key) || "null");
        if (parsed?.plan?.id) list.push(parsed);
      } catch (e) {
        /* ignore corrupted entries */
      }
    }
  }
  return list;
};

export const getOrCreateGuestKey = (): string => {
  let key = localStorage.getItem("trove_guest_key");
  if (!key) {
    key = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    localStorage.setItem("trove_guest_key", key);
  }
  return key;
};

export const makeResponseId = (guestKey: string, name: string) => `${guestKey}_${normalizeName(name)}`;

/** Secret that lets the host (and only the host) read responses from the server */
export const getHostToken = (planId: string): string => {
  const k = `trove_host_token_${planId}`;
  let token = localStorage.getItem(k);
  if (!token) {
    token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(k, token);
  }
  return token;
};

export const setHostToken = (planId: string, token: string) => localStorage.setItem(`trove_host_token_${planId}`, token);

/** Build the compact plan metadata that travels with each response */
export const buildPlanMeta = (plan: any, fallbackId: string): PlanMeta => ({
  id: String(plan?.id || fallbackId),
  summary: plan?.summary || "",
  date: plan?.date || "",
  participants: Number(plan?.participants) || 0,
  meeting_type: plan?.meeting_type,
  meeting_vibe: plan?.meeting_vibe,
  schedule: (plan?.schedule || []).map((s: any) => ({
    time: s.time,
    place_name: s.place_name,
    address: s.address,
    estimated_cost: s.estimated_cost,
  })),
  host_options: plan?.host_options,
});

/**
 * Merge responses into the stored coordination data of a plan.
 * The latest `submittedAt` wins when the same response id appears twice.
 * Returns whether anything changed (an AI result is only invalidated when it did).
 */
export const mergeResponses = (
  plan: PlanMeta,
  incoming: GuestResponse[]
): { data: CoordinationData; changed: boolean; updatedIds: string[] } => {
  const existing = loadCoordination(plan.id);
  const base: PlanMeta = existing?.plan || plan;
  // Keep host options fresh if the incoming plan has them and ours does not
  const mergedPlan: PlanMeta = { ...base, host_options: base.host_options || plan.host_options };
  const responses = existing?.responses ? [...existing.responses] : [];
  let changed = false;
  const updatedIds: string[] = [];

  incoming.forEach((resp) => {
    if (!resp?.id || !Array.isArray(resp.slots) || !Array.isArray(resp.places)) return;
    const idx = responses.findIndex((r) => r.id === resp.id);
    if (idx >= 0) {
      if (new Date(resp.submittedAt).getTime() > new Date(responses[idx].submittedAt).getTime()) {
        responses[idx] = resp;
        changed = true;
        updatedIds.push(resp.id);
      }
    } else {
      responses.push(resp);
      changed = true;
    }
  });

  const keepResult = !changed && existing;
  const data: CoordinationData = {
    plan: mergedPlan,
    responses,
    result: keepResult ? existing!.result : undefined,
    analyzedAt: keepResult ? existing!.analyzedAt : undefined,
  };
  saveCoordination(data);
  return { data, changed, updatedIds };
};

/** Import a response coming from a fallback link */
export const importResponsePayload = (
  payload: ResponsePayload,
  hostPlan?: any
): { data: CoordinationData; isUpdate: boolean } => {
  if (!payload?.plan?.id || !payload?.response?.id || !Array.isArray(payload.response.slots)) {
    throw new Error("INVALID_PAYLOAD");
  }
  const plan: PlanMeta = hostPlan ? buildPlanMeta(hostPlan, payload.plan.id) : payload.plan;
  const isUpdate = !!loadCoordination(payload.plan.id)?.responses.some((r) => r.id === payload.response.id);
  const { data } = mergeResponses(plan, [payload.response]);
  return { data, isUpdate };
};

/* ------------------------- Server sync (best effort) ------------------------- */

/** Register the plan on the server so guests' responses can be stored for the host */
export const registerInviteRemote = async (plan: PlanMeta): Promise<boolean> => {
  try {
    const res: any = await RepositoryManager.planInvites.registerInvite({
      plan_id: plan.id,
      host_token: getHostToken(plan.id),
      plan,
    });
    return !!res?.success;
  } catch (e) {
    return false;
  }
};

/** Send a guest response to the server. Returns false if the server cannot store it (fallback to link). */
export const submitResponseRemote = async (payload: ResponsePayload): Promise<boolean> => {
  try {
    const res: any = await RepositoryManager.planInvites.submitResponse(payload.plan.id, {
      plan: payload.plan,
      response: payload.response,
    });
    return !!res?.success;
  } catch (e) {
    return false;
  }
};

/** Host pulls all responses of a plan from the server. Returns null if unavailable. */
export const pullRemoteResponses = async (planId: string): Promise<GuestResponse[] | null> => {
  try {
    const res: any = await RepositoryManager.planInvites.getResponses(planId, getHostToken(planId));
    if (!res?.success) return null;
    const list = res?.data?.responses || res?.data || [];
    return Array.isArray(list) ? list : null;
  } catch (e) {
    return null;
  }
};

/* ------------------------- Overlap computation ------------------------- */

/**
 * Deterministic availability analysis: for every date, find time windows where the most
 * attendees are available. Used both as ground truth for the AI and as a fallback when the
 * AI is unavailable.
 */
export const computeCandidateSlots = (responses: GuestResponse[], minMinutes = 60): CandidateSlot[] => {
  type Entry = { resp: GuestResponse; s: number; e: number };
  const byDate = new Map<string, Entry[]>();

  responses.forEach((resp) => {
    resp.slots.forEach((slot) => {
      const s = toMinutes(slot.start);
      const e = toMinutes(slot.end);
      if (e <= s) return;
      const list = byDate.get(slot.date) || [];
      list.push({ resp, s, e });
      byDate.set(slot.date, list);
    });
  });

  const build = (min: number): CandidateSlot[] => {
    const slots: CandidateSlot[] = [];
    byDate.forEach((entries, date) => {
      const starts = Array.from(new Set(entries.map((x) => x.s))).sort((a, b) => a - b);
      starts.forEach((s) => {
        const active = entries.filter((x) => x.s <= s && x.e > s);
        const end = Math.min(...active.map((x) => x.e));
        if (end - s < min) return;
        const ids = Array.from(new Set(active.map((x) => x.resp.id)));
        const people = ids.map((id) => responses.find((r) => r.id === id)!);
        const tally = new Map<string, { name: string; votes: number; is_new?: boolean }>();
        people.forEach((p) => {
          const counted = new Set<string>();
          p.places.forEach((pl) => {
            if (!pl.name) return;
            const key = normalizeName(pl.name);
            if (counted.has(key)) return;
            counted.add(key);
            const cur = tally.get(key) || { name: pl.name, votes: 0, is_new: pl.is_new };
            cur.votes += 1;
            // A place is only "new" if nobody got it from the host's list
            if (!pl.is_new) cur.is_new = false;
            tally.set(key, cur);
          });
        });
        slots.push({
          date,
          start: fmtMinutes(s),
          end: fmtMinutes(end),
          attendeeIds: ids,
          attendeeNames: people.map((p) => p.name),
          places: Array.from(tally.values()).sort((a, b) => b.votes - a.votes),
        });
      });
    });
    return slots;
  };

  let slots = build(minMinutes);
  if (slots.length === 0) slots = build(1);

  slots.sort((a, b) => {
    if (b.attendeeIds.length !== a.attendeeIds.length) return b.attendeeIds.length - a.attendeeIds.length;
    const durA = toMinutes(a.end) - toMinutes(a.start);
    const durB = toMinutes(b.end) - toMinutes(b.start);
    if (durB !== durA) return durB - durA;
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return toMinutes(a.start) - toMinutes(b.start);
  });

  // Drop slots whose attendee set is already covered on the same date
  const seen = new Set<string>();
  const unique = slots.filter((s) => {
    const key = `${s.date}|${[...s.attendeeIds].sort().join(",")}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return unique.slice(0, 8);
};

/* ------------------------- Fallback result ------------------------- */

export const buildFallbackResult = (
  plan: PlanMeta,
  responses: GuestResponse[],
  slots: CandidateSlot[],
  isEn: boolean
): MergedPlanResult => {
  const best = slots[0];
  const allNames = responses.map((r) => r.name);
  if (!best) {
    return {
      summary: plan.summary,
      chosen: { date: plan.date, start: "", end: "", reason: "", attendees_available: [], attendees_unavailable: allNames },
      final_schedule: [],
      alternatives: [],
      attendee_fit: allNames.map((name) => ({ name, status: "no_fit", note: "" })),
      conflicts: [isEn ? "No overlapping time window was found." : "Không tìm thấy khung giờ nào trùng nhau."],
      general_advice: "",
      isFallback: true,
    };
  }
  const topPlace = best.places[0];
  const hostPlace = plan.host_options?.places.find((p) => normalizeName(p.name) === normalizeName(topPlace?.name || ""));
  const unavailable = allNames.filter((n) => !best.attendeeNames.includes(n));
  const hasVeg = responses.some((r) => r.isVegetarian && best.attendeeNames.includes(r.name));
  return {
    summary: plan.summary,
    chosen: {
      date: formatDateDisplay(best.date),
      start: best.start,
      end: best.end,
      reason: isEn
        ? `This window works for ${best.attendeeIds.length}/${responses.length} people.`
        : `Khung giờ này phù hợp với ${best.attendeeIds.length}/${responses.length} người.`,
      attendees_available: best.attendeeNames,
      attendees_unavailable: unavailable,
    },
    final_schedule: topPlace
      ? [
          {
            time: `${best.start} - ${best.end}`,
            activity_type: isEn ? "Meetup" : "Gặp mặt",
            place_name: topPlace.name,
            address: hostPlace?.address || "",
            estimated_cost: "",
            vegetarian_friendly: !hasVeg,
            vegetarian_status: hasVeg ? (isEn ? "Please confirm vegetarian options" : "Cần xác nhận món chay") : "",
            why_suitable: isEn
              ? `Most voted place (${topPlace.votes} vote(s)) among available attendees.`
              : `Địa điểm được nhiều người chọn nhất (${topPlace.votes} phiếu) trong nhóm có thể tham gia.`,
            pros: [],
            cons: [],
          },
        ]
      : [],
    alternatives: slots.slice(1, 3).map((s) => ({
      date: formatDateDisplay(s.date),
      time: `${s.start} - ${s.end}`,
      place_name: s.places[0]?.name || "",
      attendees: s.attendeeNames,
      note: "",
    })),
    attendee_fit: responses.map((r) => ({
      name: r.name,
      status: best.attendeeNames.includes(r.name) ? "fit" : "no_fit",
      note: "",
    })),
    conflicts: unavailable.length
      ? [isEn ? `${unavailable.join(", ")} cannot attend this window.` : `${unavailable.join(", ")} không thể tham gia khung giờ này.`]
      : [],
    general_advice: "",
    isFallback: true,
  };
};

/* ------------------------- AI merge ------------------------- */

// NOTE: same key currently used by SmartAIPlanner / AIChatbot. Should be moved to a backend proxy or env var.
const GEMINI_API_KEY = "AQ.Ab8RN6JS4i_WBehe3-uMoRvWJL0-h2DCXnlSj1iOMcTUiFd6Hg";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export const requestAIMerge = async (params: {
  plan: PlanMeta;
  responses: GuestResponse[];
  slots: CandidateSlot[];
  places: any[];
  isEn: boolean;
}): Promise<MergedPlanResult> => {
  const { plan, responses, slots, places, isEn } = params;
  const hostOptions = deriveHostOptions(plan);

  const promptData = {
    host_plan: { summary: plan.summary, meeting_type: plan.meeting_type, schedule: plan.schedule },
    host_options: {
      places: hostOptions.places,
      time_windows: hostOptions.slots.map((s) => ({ date: formatDateDisplay(s.date), time: `${s.start} - ${s.end}` })),
    },
    expected_participants: plan.participants,
    responses: responses.map((r) => ({
      name: r.name,
      vegetarian: r.isVegetarian,
      note: r.note || "",
      can_attend: r.slots.map((s) => ({ date: formatDateDisplay(s.date), time: `${s.start} - ${s.end}` })),
      preferred_places: r.places.map((p) => ({ name: p.name, address: p.address || "", suggested_by_guest: !!p.is_new })),
    })),
    // Hard facts computed by code. The AI MUST NOT contradict these.
    precomputed_candidate_slots: slots.map((s) => ({
      date: formatDateDisplay(s.date),
      time: `${s.start} - ${s.end}`,
      attendees_available: s.attendeeNames,
      attendees_unavailable: responses.map((r) => r.name).filter((n) => !s.attendeeNames.includes(n)),
      place_votes: s.places,
    })),
    places_database: places.slice(0, 40).map((p) => ({
      id: p.id,
      name: p.name,
      address: p.address,
      average_price: p.average_price,
      rating: p.rating || p.average_rating,
      reviews: (p.reviews || []).slice(0, 3).map((rv: any) => rv.comment),
    })),
  };

  const langRule = isEn
    ? "Write all textual fields in ENGLISH."
    : "Viết toàn bộ các trường văn bản bằng TIẾNG VIỆT.";

  const systemInstruction = `You are the TROVE group scheduling AI. The plan host offered places and time windows ("host_options"). Each attendee ticked the time windows they can attend and the places they like, and may have suggested extra places ("suggested_by_guest").
${langRule}

RULES:
1. Availability facts are in "precomputed_candidate_slots". Choose ONE of these slots as "chosen" (prefer the one with the most attendees; if tied, prefer longer window and a place with more votes). NEVER claim an attendee is available when the slot lists them as unavailable.
2. Venue: prefer the place with the most votes among attendees available in that slot. Places from host_options are trusted by the host; guest-suggested places are acceptable if clearly the most voted. If a vegetarian attendee is available, prefer a vegetarian-friendly place and say so honestly. You may use "places_database" reviews as reference but never invent reviews or addresses; leave address empty if unknown.
3. Build a concrete final_schedule of 1-2 stops fully inside the chosen window. "time" format: "HH:mm - HH:mm".
4. "date" format: DD/MM/YYYY. "attendees_*" and "attendee_fit.name" must use the exact attendee names.
5. "alternatives": up to 2 other good slots. "conflicts": honest list of people/preferences that could not be satisfied (empty array if none).
6. attendee_fit.status: "fit" if available in chosen slot, "partial" if only partly overlapping, otherwise "no_fit".

OUTPUT JSON ONLY:
{
  "summary": "short summary of the final plan",
  "chosen": { "date": "DD/MM/YYYY", "start": "HH:mm", "end": "HH:mm", "reason": "why this slot", "attendees_available": ["name"], "attendees_unavailable": ["name"] },
  "final_schedule": [
    { "time": "HH:mm - HH:mm", "activity_type": "...", "place_name": "...", "address": "...", "estimated_cost": "...", "vegetarian_friendly": true, "vegetarian_status": "...", "why_suitable": "...", "pros": ["..."], "cons": ["..."] }
  ],
  "alternatives": [ { "date": "DD/MM/YYYY", "time": "HH:mm - HH:mm", "place_name": "...", "attendees": ["name"], "note": "..." } ],
  "attendee_fit": [ { "name": "name", "status": "fit", "note": "..." } ],
  "conflicts": ["..."],
  "general_advice": "advice for the host"
}`;

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: "user", parts: [{ text: `Group scheduling data:\n${JSON.stringify(promptData)}` }] }],
      generationConfig: { temperature: 0.3, responseMimeType: "application/json" },
    }),
  });

  if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);
  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error("EMPTY_AI_RESPONSE");

  const parsed = JSON.parse(rawText.replace(/```json/g, "").replace(/```/g, "").trim());

  // Normalise so the UI never crashes on a missing field
  return {
    summary: parsed.summary || plan.summary,
    chosen: {
      date: parsed.chosen?.date || "",
      start: parsed.chosen?.start || "",
      end: parsed.chosen?.end || "",
      reason: parsed.chosen?.reason || "",
      attendees_available: parsed.chosen?.attendees_available || [],
      attendees_unavailable: parsed.chosen?.attendees_unavailable || [],
    },
    final_schedule: (parsed.final_schedule || []).map((s: any) => ({
      time: s.time || "",
      activity_type: s.activity_type || "",
      place_name: s.place_name || "",
      address: s.address || "",
      estimated_cost: s.estimated_cost || "",
      vegetarian_friendly: !!s.vegetarian_friendly,
      vegetarian_status: s.vegetarian_status || "",
      why_suitable: s.why_suitable || "",
      pros: s.pros || [],
      cons: s.cons || [],
    })),
    alternatives: parsed.alternatives || [],
    attendee_fit: parsed.attendee_fit || [],
    conflicts: parsed.conflicts || [],
    general_advice: parsed.general_advice || "",
  };
};
