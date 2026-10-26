import Member from '../models/Member.js';
import Transaction from '../models/Transaction.js';

// @desc    Get all members
// @route   GET /api/members
export const getMembers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const members = await Member.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: members.length, data: members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single member
// @route   GET /api/members/:id
export const getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    res.status(200).json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a new member
// @route   POST /api/members
export const addMember = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and phone number',
      });
    }

    const existingMember = await Member.findOne({ email: email.trim().toLowerCase() });
    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'A member with this email already exists',
      });
    }

    const member = await Member.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      membershipDate: new Date(),
    });

    res.status(201).json({ success: true, data: member, message: 'Member added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update member details
// @route   PUT /api/members/:id
export const updateMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const { name, email, phone } = req.body;

    if (email && email.trim().toLowerCase() !== member.email) {
      const existing = await Member.findOne({ email: email.trim().toLowerCase() });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Another member with this email already exists',
        });
      }
      member.email = email.trim().toLowerCase();
    }

    if (name) member.name = name.trim();
    if (phone) member.phone = phone.trim();

    await member.save();
    res.status(200).json({ success: true, data: member, message: 'Member updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a member
// @route   DELETE /api/members/:id
export const deleteMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // Check if the member has any unreturned books
    const activeIssue = await Transaction.findOne({
      memberId: member._id,
      status: 'Issued',
    });

    if (activeIssue) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete member who currently has issued books. Please record book returns first.',
      });
    }

    await Member.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
