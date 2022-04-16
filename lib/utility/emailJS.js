export function generateAppointmentDetailMessage (appointment) {
    let serviceDetailMessage = "";

    appointment.services.forEach((service, index) => {
        if (index == appointment.services.length-1 && index != 0) {
            serviceDetailMessage += " and";
        }

        serviceDetailMessage += ` ${service.name}`;
        serviceDetailMessage += ` ${service.type}`;
        serviceDetailMessage += (service?.kind?.type) ? ` ${service.kind.type}` : "";
        serviceDetailMessage += ','
    });

    const appointmentTime = new Date(appointment.time);

    let timeDetailMessage = `on ${appointmentTime.toDateString()} at ${appointmentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;

    return `${serviceDetailMessage} ${timeDetailMessage}`;
};
