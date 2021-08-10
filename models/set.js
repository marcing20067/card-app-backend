const mongoose = require('mongoose');
const { Schema } = mongoose;


const CardSchema = new Schema({
    concept: { type: String, required: true },
    definition: { type: String, required: true},
    group: { type: Number, required: true, min: 1, max: 5}
}, { versionKey: false })

const StatsSchema = new Schema({
    group1: { type: Number, required: true, min: 0},
    group2: { type: Number, required: true, min: 0},
    group3: { type: Number, required: true, min: 0},
    group4: { type: Number, required: true, min: 0},
    group5: { type: Number, required: true, min: 0}
}, { versionKey: false })

const SetSchema = new Schema(
    {
        name: { type: String, required: true },
        cards: { type: [CardSchema], required: true },
        stats: { type: StatsSchema, required: true},
        creator: { type: String, required: true }
    }, { versionKey: false }
);

module.exports = mongoose.model('Set', SetSchema);
