const Budget = require("../models/Budget");
const Event = require("../models/Events");
const { EVENT_STATUS } = require("../utils/constants");
const aggregate = require("../services/budgetAggregation.service");

exports.generateBudget = async (req, res) => {
  const event = await Event.findByPk(req.params.eventId);

  if (event.status !== EVENT_STATUS.BUDGET_PENDING) {
    return res.status(400).json({ message: "Invalid state" });
  }

  const total = await aggregate.aggregateBudget(event.id);

  const budget = await Budget.create({
    event_id: event.id,
    aggregated_amount: total
  });

  event.status = EVENT_STATUS.BUDGET_AGGREGATED;
  await event.save();

  res.json(budget);
};

exports.getBudget = async (req, res) => {
  const budget = await Budget.findOne({
    where: { event_id: req.params.eventId }
  });
  res.json(budget);
};
