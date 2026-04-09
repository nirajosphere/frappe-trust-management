import { 
    DOCTYPE_DONOR, DOCTYPE_TEMPLE, DOCTYPE_DONATION, DOCTYPE_DONATION_TYPE, DOCTYPE_USER 
} from "./constants";
import { donorFormFields } from "../formfield/donorFormFields";
import { templeFormFields } from "../formfield/templeFormFields";
import { donationFormFields } from "../formfield/donationFormFields";
import { donationTypeFormFields } from "../formfield/donationTypeFormFields";
import { userFormFields } from "../formfield/userFormFields";

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
};


