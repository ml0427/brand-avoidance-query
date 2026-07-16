import { records as techSecurityServicesRecords } from "./tech-security-services.mjs";
import { records as oralFamilyTravelRecords } from "./oral-family-travel.mjs";
import { records as digitalCommerceAppsRecords } from "./digital-commerce-apps.mjs";
import { records as foodBeverageRestaurantsRecords } from "./food-beverage-restaurants.mjs";
import { records as apparelAutoHomeRecords } from "./apparel-auto-home.mjs";
import { records as publicFiguresPoliticsRecords } from "./public-figures-politics.mjs";
import { records as judicialPoliticsListsRecords } from "./judicial-politics-lists.mjs";
import { records as officialCoachRosterPersonalRecords } from "./official-coach-roster-personal.mjs";
import { records as localBusinessTravelPersonalRecords } from "./local-business-travel-personal.mjs";

export const riskRecords = [
  ...techSecurityServicesRecords,
  ...oralFamilyTravelRecords,
  ...digitalCommerceAppsRecords,
  ...foodBeverageRestaurantsRecords,
  ...apparelAutoHomeRecords,
  ...publicFiguresPoliticsRecords,
  ...judicialPoliticsListsRecords,
  ...officialCoachRosterPersonalRecords,
  ...localBusinessTravelPersonalRecords,
];
