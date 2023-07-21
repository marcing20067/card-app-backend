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
          let duplicateIndex = 0;

          for (const card1 of cards) {
            let duplicatesCount = 0;

            for (const card2 of cards) {
              if (card1.concept === card2.concept) {
                duplicatesCount++;
              }

              if (duplicatesCount >= 2) {
                cards.length = duplicateIndex + 1;
                return false;
              }
            }

            duplicateIndex++;
          }

          return true;
        },
        message: (props) => {
          const cards = props.value;
          const invalidCard = cards[cards.length - 1];
          return `Concept "${invalidCard.concept}" is duplicated.`;
        },
      },
      required: true,
    },
    stats: {
      group1: { type: Number, required: true, min: 0 },
      group2: { type: Number, required: true, min: 0 },
      group3: { type: Number, required: true, min: 0 },
      group4: { type: Number, required: true, min: 0 },
      group5: { type: Number, required: true, min: 0 },
    },
    creator: { type: Schema.Types.ObjectId, required: true },
  },
  { versionKey: false }
);

exports.Set = mongoose.model("Set", SetSchema);
