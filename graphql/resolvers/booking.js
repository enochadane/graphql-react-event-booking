const Event = require('../../models/event')
const Booking = require('../../models/booking')
const { dateToString } = require('../../helpers/date')
const { singleEvent, user, transformEvent } = require('./merge')

module.exports = {
    bookings: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated!')
        }
        try {
            const bookings = await Booking.find()
            return bookings.map(booking => {
                return {
                    ...booking._doc,
                    user: user.bind(this, booking._doc.user),
                    event: singleEvent.bind(this, booking._doc.event),
                    createdAt: dateToString(booking._doc.createdAt),
                    updatedAt: dateToString(booking._doc.updatedAt)
                }
            })
        } catch (err) {
            throw err
        }
    },
    bookEvent: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated!')
        }
        const fetchedEvent = await Event.findOne({ _id: args.eventId })
        const booking = new Booking({
            user: '6399dc29b80b8ea4e1834e04',
            event: fetchedEvent
        })
        const result = await booking.save()
        return {
            ...result._doc,
            user: user.bind(this, booking._doc.user),
            event: singleEvent.bind(this, booking._doc.event),
            createdAt: dateToString(result._doc.createdAt),
            updatedAt: dateToString(result._doc.updatedAt)
        }
    },
    cancelBooking: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated!')
        }
        try {
            const booking = await Booking.findById(args.bookingId).populate('event')
            const event = transformEvent(booking.event)
            await Booking.deleteOne({ _id: args.bookingId })

            return event

        } catch (err) {
            throw err
        }
    }
}
