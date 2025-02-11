import PropTypes from "prop-types";
import { Lock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function NotAuthorisedMessage({ message = "You are not authorised to view this page." }) {
  return (
    <Alert variant="destructive" className="m-8 max-w-md">
      <Lock className="h-4 w-4" />
      <AlertTitle>Not Authorised</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

NotAuthorisedMessage.propTypes = {
  message: PropTypes.string
};
