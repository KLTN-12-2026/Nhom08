import { auth } from "./remote/auth";
import { dashboard } from "./remote/dashboard";
import { userData } from "./remote/user";
import placesAPI from "./remote/places";
import tagsAPI from "./remote/tags";
import categoriesAPI from "./remote/categories";
import announcementsAPI from "./remote/announcements";
import { activityGroups } from "./remote/activityGroups";
import { statistics } from "./remote/statistics";
import * as quotes from "./remote/quotes";
import { ticketsUser, ticketsAdmin } from "./remote/tickets";
import settingsAPI from "./remote/settings";
import { notificationsAdmin } from "./remote/notifications";
import subscriptionsAPI from "./remote/subscriptions";
import plansAPI from "./remote/plans";
import planInvitesAPI from "./remote/planInvites";

const RepositoryManager = {
  auth,
  dashboard,
  users: userData,
  // Alias for backward compatibility
  userData,
  places: placesAPI,
  tags: tagsAPI,
  categories: categoriesAPI,
  announcements: announcementsAPI,
  activityGroups,
  statistics,
  quotes,
  ticketsUser,
  ticketsAdmin,
  settings: settingsAPI,
  notificationsAdmin,
  subscriptions: subscriptionsAPI,
  plans: plansAPI,
  planInvites: planInvitesAPI,
};

export { RepositoryManager };
export default RepositoryManager;
