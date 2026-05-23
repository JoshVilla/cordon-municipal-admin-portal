import { sileo } from "sileo";

type ToastType = "success" | "error";
type ToastMessage = string | React.ReactNode;

export const useSileoToast = () => {
  const showToast = (type: ToastType, message: ToastMessage) => {
    const sharedTextStyle = "text-white ";

    if (type === "success") {
      sileo.success({
        title: "Success",
        description: message, // can be string or ReactNode
        type: "success",
        fill: "#E4FFE3",
        roundness: 12,
        styles: {
          title: sharedTextStyle,
          description: sharedTextStyle,
          badge: "bg-green-500 rounded-md",
          button: "bg-green-600 text-white rounded-sm hover:bg-green-700",
        },
      });
    } else if (type === "error") {
      sileo.error({
        title: "Error",
        description: message,
        type: "error",
        fill: "#FEE2E2",
        roundness: 12,
        styles: {
          title: sharedTextStyle,
          description: sharedTextStyle,
          badge: "bg-red-500 rounded-md",
          button: "bg-red-600 text-white rounded-sm hover:bg-red-700",
        },
      });
    }
  };

  return { showToast };
};