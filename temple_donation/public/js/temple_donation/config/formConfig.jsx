import { 
    DOCTYPE_DONOR, DOCTYPE_TEMPLE, DOCTYPE_DONATION, DOCTYPE_DONATION_TYPE, DOCTYPE_USER,
    DOCTYPE_ITEM, DOCTYPE_INVENTORY_ENTRY, DOCTYPE_ROOM, DOCTYPE_ROOM_BOOKING
} from "./constants";
import { donorFormFields } from "../formfield/donorFormFields";
import { templeFormFields } from "../formfield/templeFormFields";
import { donationFormFields } from "../formfield/donationFormFields";
import { donationTypeFormFields } from "../formfield/donationTypeFormFields";
import { userFormFields } from "../formfield/userFormFields";
import { itemFormFields } from "../formfield/itemFormFields";
import { inventoryEntryFormFields } from "../formfield/inventoryEntryFormFields";
import { roomFormFields } from "../formfield/roomFormFields";
import { roomBookingFormFields } from "../formfield/roomBookingFormFields";

/**
 * Centralized form configuration for different Doctypes.
 * Each configuration defines:
 * - fields: Array of field settings (name, label, type, required, etc.)
 */
export const formConfigs = {
    [DOCTYPE_DONOR]: donorFormFields,
    [DOCTYPE_TEMPLE]: templeFormFields,
    [DOCTYPE_DONATION]: donationFormFields,
    [DOCTYPE_DONATION_TYPE]: donationTypeFormFields,
    [DOCTYPE_USER]: userFormFields,
    [DOCTYPE_ITEM]: itemFormFields,
    [DOCTYPE_INVENTORY_ENTRY]: inventoryEntryFormFields,
    [DOCTYPE_ROOM]: roomFormFields,
    [DOCTYPE_ROOM_BOOKING]: roomBookingFormFields,
};


