const mongoose = require("mongoose");
const { Schema } = mongoose;

const SetSchema = new Schema(
  {
    name: { type: String, required: true, minLength: 3, maxLength: 25 },
    cards: {
      type: [
        {
          _id: false,
          concept: { type: String, required: true, maxLength: 50 },
          definition: { type: String, required: true, maxLength: 100 },
          group: { type: Number, required: true, min: 1, max: 6 },
          example: { type: String, maxLength: 100 },
        },
      ],
      validate: {
        validator: (cards) => {
          let isDuplicateCard = false;
          cards.forEach((el, i) => {
            const cardsWithDefinition = cards.filter(
              (c) => c.concept === el.concept
            );
            isDuplicateCard = cardsWithDefinition.length >= 2;
            if (isDuplicateCard) {
              cards.length = i + 1;
            }
          });

          return !isDuplicateCard;
        },
        message: (props) => {
          const cards = props.value;
          const invalidSet = cards[cards.length - 1];
          return `Concept "${invalidSet.concept}" is duplicated.`;
        },
      },
      required: true,
    },
    stats: {
      type: {
        group1: { type: Number, required: true, min: 0 },
        group2: { type: Number, required: true, min: 0 },
        group3: { type: Number, required: true, min: 0 },
        group4: { type: Number, required: true, min: 0 },
        group5: { type: Number, required: true, min: 0 },
      },
      required: true,
    },
    creator: { type: Schema.Types.ObjectId, required: true },
  },
  { versionKey: false }
);

exports.Set = mongoose.model("Set", SetSchema);
