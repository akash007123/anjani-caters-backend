const Employee = require('../models/Employee');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
const getEmployees = async (req, res) => {
  try {
    const { department, role, isActive, search } = req.query;
    
    let query = {};
    
    if (department) {
      query.department = department;
    }
    
    if (role) {
      query.role = role;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }

    const employees = await Employee.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private
const createEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      address,
      education,
      profilePic,
      aadharCard,
      panCard,
      bankPassbook,
      department,
      role
    } = req.body;

    // Check if employee with email already exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this email already exists'
      });
    }

    // Check if employee with mobile already exists
    const existingMobile = await Employee.findOne({ mobile });
    if (existingMobile) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this mobile number already exists'
      });
    }

    const employee = await Employee.create({
      name,
      email,
      mobile,
      address,
      education,
      profilePic,
      aadharCard,
      panCard,
      bankPassbook,
      department,
      role
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private
const updateEmployee = async (req, res) => {
  try {
    let employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check for duplicate email (excluding current employee)
    if (req.body.email && req.body.email !== employee.email) {
      const existingEmail = await Employee.findOne({ email: req.body.email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Employee with this email already exists'
        });
      }
    }

    // Check for duplicate mobile (excluding current employee)
    if (req.body.mobile && req.body.mobile !== employee.mobile) {
      const existingMobile = await Employee.findOne({ mobile: req.body.mobile });
      if (existingMobile) {
        return res.status(400).json({
          success: false,
          message: 'Employee with this mobile number already exists'
        });
      }
    }

    employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    await Employee.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get employee statistics
// @route   GET /api/employees/stats
// @access  Private
const getEmployeeStats = async (req, res) => {
  try {
    const stats = await Employee.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalEmployees = await Employee.countDocuments({ isActive: true });
    const inactiveEmployees = await Employee.countDocuments({ isActive: false });

    res.status(200).json({
      success: true,
      data: {
        byDepartment: stats,
        total: totalEmployees,
        inactive: inactiveEmployees
      }
    });
  } catch (error) {
    console.error('Error fetching employee stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats
};
