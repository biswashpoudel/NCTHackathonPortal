import React, { useState } from 'react';
import { Pencil, Trash2, Eye, Send, Plus, LogOut } from 'lucide-react';

// Main Admin Dashboard Component
const AdminDashboard = () => {
  // States for data management
  const [activeTab, setActiveTab] = useState('hackathons');
  const [users, setUsers] = useState([
    { id: 1, username: 'john_doe', email: 'john@example.com', role: 'user' },
    { id: 2, username: 'jane_smith', email: 'jane@example.com', role: 'judge' },
    { id: 3, username: 'mike_jones', email: 'mike@example.com', role: 'mentor' }
  ]);
  const [hackathons, setHackathons] = useState([
    { id: 1, name: 'AI Innovation Hackathon', status: 'active', startDate: '2025-03-01', endDate: '2025-03-07', participantsCount: 45, maxParticipants: 50 },
    { id: 2, name: 'Web3 Challenge', status: 'upcoming', startDate: '2025-04-15', endDate: '2025-04-22', participantsCount: 20, maxParticipants: 100 }
  ]);
  const [participants, setParticipants] = useState([
    { id: 1, username: 'participant1', team: 'CodeNinjas', joinedAt: '2025-02-15', status: 'active' },
    { id: 2, username: 'participant2', team: 'TechTitans', joinedAt: '2025-02-16', status: 'active' }
  ]);
  const [submissions, setSubmissions] = useState([
    { id: 1, team: 'CodeNinjas', title: 'AI Assistant', submittedAt: '2025-03-05', status: 'pending', score: null },
    { id: 2, team: 'TechTitans', title: 'Blockchain Marketplace', submittedAt: '2025-03-06', status: 'approved', score: 85 }
  ]);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  
  // Form states
  const [userForm, setUserForm] = useState({ username: '', email: '', password: '', role: 'user' });
  const [hackathonForm, setHackathonForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxParticipants: 100,
    maxTeamSize: 5,
    status: 'upcoming'
  });
  const [notificationForm, setNotificationForm] = useState({ title: '', message: '', recipients: 'all' });
  
  // Dialog states
  const [showHackathonForm, setShowHackathonForm] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [loading, setLoading] = useState(false);
  
  // Form handlers
  const handleUserChange = (e) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  };
  
  const handleHackathonChange = (e) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
    setHackathonForm({ ...hackathonForm, [e.target.name]: value });
  };
  
  // Submit handlers
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const res = await axios.post("http://localhost:5000/register", userForm);
      const newUser = res.data.user; 
      setUsers([...users, newUser]);
      setUserForm({ username: '', email: '', password: '', role: 'user' });
      showAlertMessage('success', 'User registered successfully');
    } catch (error) {
      showAlertMessage('error', error.response?.data?.message || 'Error registering user');
    } finally {
      setLoading(false);
    }
  };
  
  const handleHackathonSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (selectedHackathon) {
        // Update existing hackathon
        const updatedHackathons = hackathons.map(h => 
          h.id === selectedHackathon.id ? { ...hackathonForm, id: h.id } : h
        );
        setHackathons(updatedHackathons);
        showAlertMessage('success', 'Hackathon updated successfully');
      } else {
        // Create new hackathon
        const newHackathon = {
          id: hackathons.length + 1,
          ...hackathonForm,
          participantsCount: 0
        };
        setHackathons([...hackathons, newHackathon]);
        showAlertMessage('success', 'Hackathon created successfully');
      }
      resetHackathonForm();
      setShowHackathonForm(false);
      setLoading(false);
    }, 500);
  };
  
  const handleNotificationSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate sending notification
    setTimeout(() => {
      showAlertMessage('success', `Notification "${notificationForm.title}" sent to ${notificationForm.recipients}`);
      setNotificationForm({ title: '', message: '', recipients: 'all' });
      setLoading(false);
    }, 500);
  };
  
  // CRUD operations
  const deleteUser = (id) => {
    setUsers(users.filter(user => user.id !== id));
    showAlertMessage('success', 'User deleted successfully');
  };
  
  const editHackathon = (hackathon) => {
    setSelectedHackathon(hackathon);
    setHackathonForm({
      name: hackathon.name,
      description: hackathon.description || '',
      startDate: hackathon.startDate,
      endDate: hackathon.endDate,
      registrationDeadline: hackathon.registrationDeadline || '',
      maxParticipants: hackathon.maxParticipants || 100,
      maxTeamSize: hackathon.maxTeamSize || 5,
      status: hackathon.status || 'upcoming'
    });
    setShowHackathonForm(true);
  };
  
  const deleteHackathon = (id) => {
    setHackathons(hackathons.filter(hackathon => hackathon.id !== id));
    showAlertMessage('success', 'Hackathon deleted successfully');
  };
  
  const viewHackathonDetails = (hackathon) => {
    setSelectedHackathon(hackathon);
    setActiveTab('participants');
  };
  
  const removeParticipant = (id) => {
    setParticipants(participants.filter(participant => participant.id !== id));
    showAlertMessage('success', 'Participant removed successfully');
  };
  
  const updateSubmissionStatus = (id, status) => {
    setSubmissions(submissions.map(submission => 
      submission.id === id ? { ...submission, status } : submission
    ));
    showAlertMessage('success', 'Submission status updated');
  };
  
  const deleteSubmission = (id) => {
    setSubmissions(submissions.filter(submission => submission.id !== id));
    showAlertMessage('success', 'Submission deleted successfully');
  };
  
  // Helper functions
  const showAlertMessage = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
  };
  
  const resetHackathonForm = () => {
    setHackathonForm({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      registrationDeadline: '',
      maxParticipants: 100,
      maxTeamSize: 5,
      status: 'upcoming'
    });
    setSelectedHackathon(null);
  };
  
  // Render helper functions
  const renderTabButton = (value, label) => (
    <button 
      className={`px-4 py-2 font-medium ${activeTab === value ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} rounded-md`}
      onClick={() => setActiveTab(value)}
    >
      {label}
    </button>
  );
  
  const renderAlert = () => {
    if (!alert.show) return null;
    return (
      <div className={`p-4 mb-4 rounded ${alert.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
        {alert.message}
      </div>
    );
  };
  
  // Tab content components
  const HackathonsTab = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Manage Hackathons</h2>
        <button 
          onClick={() => {
            resetHackathonForm();
            setShowHackathonForm(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          <Plus size={16} /> Add New Hackathon
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left border">ID</th>
              <th className="p-2 text-left border">Name</th>
              <th className="p-2 text-left border">Status</th>
              <th className="p-2 text-left border">Dates</th>
              <th className="p-2 text-left border">Participants</th>
              <th className="p-2 text-left border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {hackathons.map(hackathon => (
              <tr key={hackathon.id} className="border-b hover:bg-gray-50">
                <td className="p-2 border">{hackathon.id}</td>
                <td className="p-2 border">{hackathon.name}</td>
                <td className="p-2 border">
                  <span className={`px-2 py-1 rounded text-xs ${
                    hackathon.status === 'active' ? 'bg-green-100 text-green-800' :
                    hackathon.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {hackathon.status}
                  </span>
                </td>
                <td className="p-2 border">
                  {hackathon.startDate && (
                    <>
                      <div>Start: {hackathon.startDate}</div>
                      <div>End: {hackathon.endDate}</div>
                    </>
                  )}
                </td>
                <td className="p-2 border">{hackathon.participantsCount}/{hackathon.maxParticipants}</td>
                <td className="p-2 border">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => viewHackathonDetails(hackathon)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => editHackathon(hackathon)}
                      className="p-1 text-yellow-600 hover:bg-yellow-100 rounded"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={() => deleteHackathon(hackathon.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  const UsersTab = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">Register a New User</h2>
      <form onSubmit={handleUserSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block mb-1 text-sm font-medium">Username</label>
          <input 
            type="text"
            name="username" 
            className="w-full p-2 border rounded"
            placeholder="Username" 
            value={userForm.username} 
            onChange={handleUserChange} 
            required 
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Email</label>
          <input 
            type="email"
            name="email" 
            className="w-full p-2 border rounded"
            placeholder="Email" 
            value={userForm.email} 
            onChange={handleUserChange} 
            required 
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Password</label>
          <input 
            type="password"
            name="password" 
            className="w-full p-2 border rounded"
            placeholder="Password" 
            value={userForm.password} 
            onChange={handleUserChange} 
            required 
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Role</label>
          <select 
            name="role"
            className="w-full p-2 border rounded"
            value={userForm.role} 
            onChange={handleUserChange}
          >
            <option value="user">User</option>
            <option value="judge">Judge</option>
            <option value="mentor">Mentor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button 
          type="submit" 
          className="md:col-span-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register User'}
        </button>
      </form>
      
      <h2 className="text-xl font-bold mb-4">Registered Users</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left border">ID</th>
              <th className="p-2 text-left border">Username</th>
              <th className="p-2 text-left border">Email</th>
              <th className="p-2 text-left border">Role</th>
              <th className="p-2 text-left border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-2 border">{user.id}</td>
                <td className="p-2 border">{user.username}</td>
                <td className="p-2 border">{user.email}</td>
                <td className="p-2 border">
                  <span className={`px-2 py-1 rounded text-xs ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'judge' ? 'bg-yellow-100 text-yellow-800' :
                    user.role === 'mentor' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-2 border">
                  <button 
                    onClick={() => deleteUser(user.id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  const NotificationsTab = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">Send Notifications</h2>
      <form onSubmit={handleNotificationSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Title</label>
          <input 
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Notification Title" 
            value={notificationForm.title} 
            onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
            required 
          />
        </div>
        
        <div>
          <label className="block mb-1 text-sm font-medium">Message</label>
          <textarea 
            className="w-full p-2 border rounded"
            placeholder="Enter your message here" 
            value={notificationForm.message} 
            onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
            rows={4}
            required 
          />
        </div>
        
        <div>
          <label className="block mb-1 text-sm font-medium">Recipients</label>
          <select 
            className="w-full p-2 border rounded"
            value={notificationForm.recipients} 
            onChange={(e) => setNotificationForm({...notificationForm, recipients: e.target.value})}
          >
            <option value="all">All Users</option>
            <option value="participants">Participants Only</option>
            <option value="judges">Judges Only</option>
            <option value="mentors">Mentors Only</option>
          </select>
        </div>
        
        <button 
          type="submit" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
          disabled={loading}
        >
          <Send size={16} /> {loading ? 'Sending...' : 'Send Notification'}
        </button>
      </form>
    </div>
  );
  
  const ParticipantsTab = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">
        Participants for {selectedHackathon ? selectedHackathon.name : ''}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left border">ID</th>
              <th className="p-2 text-left border">User</th>
              <th className="p-2 text-left border">Team</th>
              <th className="p-2 text-left border">Joined</th>
              <th className="p-2 text-left border">Status</th>
              <th className="p-2 text-left border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {participants.map(participant => (
              <tr key={participant.id} className="border-b hover:bg-gray-50">
                <td className="p-2 border">{participant.id}</td>
                <td className="p-2 border">{participant.username}</td>
                <td className="p-2 border">{participant.team || 'No Team'}</td>
                <td className="p-2 border">{participant.joinedAt}</td>
                <td className="p-2 border">
                  <span className={`px-2 py-1 rounded text-xs ${
                    participant.status === 'active' ? 'bg-green-100 text-green-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {participant.status}
                  </span>
                </td>
                <td className="p-2 border">
                  <button 
                    onClick={() => removeParticipant(participant.id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  const SubmissionsTab = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">
        Submissions for {selectedHackathon ? selectedHackathon.name : ''}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left border">ID</th>
              <th className="p-2 text-left border">Team</th>
              <th className="p-2 text-left border">Project</th>
              <th className="p-2 text-left border">Submitted</th>
              <th className="p-2 text-left border">Status</th>
              <th className="p-2 text-left border">Score</th>
              <th className="p-2 text-left border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map(submission => (
              <tr key={submission.id} className="border-b hover:bg-gray-50">
                <td className="p-2 border">{submission.id}</td>
                <td className="p-2 border">{submission.team || 'Individual'}</td>
                <td className="p-2 border">{submission.title}</td>
                <td className="p-2 border">{submission.submittedAt}</td>
                <td className="p-2 border">
                  <select 
                    className="p-1 border rounded"
                    value={submission.status} 
                    onChange={(e) => updateSubmissionStatus(submission.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td className="p-2 border">{submission.score || 'Not scored'}</td>
                <td className="p-2 border">
                  <div className="flex space-x-2">
                    <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => deleteSubmission(submission.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  // Hackathon Form Modal
  const HackathonFormModal = () => {
    if (!showHackathonForm) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
          <h2 className="text-xl font-bold mb-4">
            {selectedHackathon ? 'Edit Hackathon' : 'Create New Hackathon'}
          </h2>
          
          <form onSubmit={handleHackathonSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium">Name</label>
              <input 
                type="text"
                name="name" 
                className="w-full p-2 border rounded"
                placeholder="Hackathon Name" 
                value={hackathonForm.name} 
                onChange={handleHackathonChange} 
                required 
              />
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium">Description</label>
              <textarea 
                name="description" 
                className="w-full p-2 border rounded"
                placeholder="Describe the hackathon" 
                value={hackathonForm.description} 
                onChange={handleHackathonChange} 
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Start Date</label>
                <input 
                  type="date" 
                  name="startDate" 
                  className="w-full p-2 border rounded"
                  value={hackathonForm.startDate} 
                  onChange={handleHackathonChange} 
                  required 
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium">End Date</label>
                <input 
                  type="date" 
                  name="endDate" 
                  className="w-full p-2 border rounded"
                  value={hackathonForm.endDate} 
                  onChange={handleHackathonChange} 
                  required 
                />
              </div>
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium">Registration Deadline</label>
              <input 
                type="date" 
                name="registrationDeadline" 
                className="w-full p-2 border rounded"
                value={hackathonForm.registrationDeadline} 
                onChange={handleHackathonChange} 
                required 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Max Participants</label>
                <input 
                  type="number" 
                  name="maxParticipants" 
                  className="w-full p-2 border rounded"
                  value={hackathonForm.maxParticipants} 
                  onChange={handleHackathonChange} 
                  min="1"
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium">Max Team Size</label>
                <input 
                  type="number" 
                  name="maxTeamSize" 
                  className="w-full p-2 border rounded"
                  value={hackathonForm.maxTeamSize} 
                  onChange={handleHackathonChange} 
                  min="1" 
                />
              </div>
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium">Status</label>
              <select 
                name="status"
                className="w-full p-2 border rounded"
                value={hackathonForm.status} 
                onChange={handleHackathonChange}
              >
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <button 
                type="button" 
                className="px-4 py-2 border rounded"
                onClick={() => setShowHackathonForm(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-blue-600 text-white rounded"
                disabled={loading}
              >
                {loading ? 'Saving...' : (selectedHackathon ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  // Main render
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Hackathon Admin Dashboard</h1>
          <button className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-md">
            <LogOut size={16} /> Logout
          </button>
        </header>
        
        {renderAlert()}
        
        <div className="mb-6 flex space-x-2">
          {renderTabButton('hackathons', 'Hackathons')}
          {renderTabButton('users', 'Users')}
          {renderTabButton('notifications', 'Notifications')}
          {selectedHackathon && (
            <>
              {renderTabButton('participants', 'Participants')}
              {renderTabButton('submissions', 'Submissions')}
            </>
          )}
        </div>
        
        {/* Tab Content */}
        {activeTab === 'hackathons' && <HackathonsTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'participants' && selectedHackathon && <ParticipantsTab />}
        {activeTab === 'submissions' && selectedHackathon && <SubmissionsTab />}
        
        {/* Modals */}
        <HackathonFormModal />
      </div>
    </div>
  );
};

export default AdminDashboard;