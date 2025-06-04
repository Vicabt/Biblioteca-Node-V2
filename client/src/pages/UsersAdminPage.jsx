import React, { useState, useEffect } from 'react';
import { Button, Table } from 'react-bootstrap'; // Keep Button and Table if used
import apiService from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import UserModal from '../components/users/UserModal';
import { Modal as AntdModal, Button as AntButton, Form, Input, message } from 'antd'; // Use AntdModal explicitly

const roleColors = {
  'Administrador': 'bg-red-100 text-red-800',
  'Bibliotecario': 'bg-blue-100 text-blue-800',
  'Usuario': 'bg-green-100 text-green-800',
};

const UsersAdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false); // State for password reset modal
  const [selectedUserId, setSelectedUserId] = useState(null); // State for selected user ID for password reset
  const [form] = Form.useForm(); // For Add/Edit User form
  const [passwordForm] = Form.useForm(); // For Reset Password form
  // const [modalLoading, setModalLoading] = useState(false); // Removed as it's not used consistently and causes errors

  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      message.error(`Error al cargar usuarios: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsModalOpen(true);
  };

  const handleOpenPasswordModal = (userId) => {
    setSelectedUserId(userId);
    passwordForm.resetFields();
    setIsPasswordModalOpen(true);
  };

  const handleCancelPasswordModal = () => {
    setIsPasswordModalOpen(false);
    setSelectedUserId(null);
    passwordForm.resetFields();
  };

  const handleResetPassword = async (values) => {
    if (!selectedUserId) return;
    try {
      // Consider adding setLoading(true) here and setLoading(false) in finally if this is a long operation
      await apiService.resetUserPassword(selectedUserId, values.password); // selectedUserId should be the correct user ID
      message.success('Contraseña restablecida exitosamente');
      handleCancelPasswordModal();
    } catch (err) {
      message.error(`Error al restablecer la contraseña: ${err.message}`);
    }
  };

  // This function seems to be intended for the UserModal's submit
  const handleSaveUser = async (values) => {
    // setLoading(true); // Use the main loading or a specific one for the modal
    try {
      if (editingUser) {
        await apiService.updateUser(editingUser.id, values);
        toast.success('Usuario actualizado');
      } else {
        await apiService.createUser(values);
        toast.success('Usuario creado');
      }
      setIsModalOpen(false); // Close the modal
      setEditingUser(null); // Reset editing user
      fetchUsers(); // Refresh the user list
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error al guardar usuario');
    } finally {
      // setLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    form.resetFields(); // Also reset the form on close
  };

  // handleModalSubmit is effectively replaced by handleSaveUser and integrated into UserModal
  // const handleModalSubmit = async (formData) => { ... }; // Keep if UserModal doesn't handle its own submit

  const handleToggleActive = async (user) => {
    try {
      // setLoading(true); // Optional: for visual feedback
      await apiService.toggleUserActive(user.id, !user.active);
      toast.success(`Usuario ${user.active ? 'desactivado' : 'activado'}`);
      fetchUsers();
    } catch (error) {
      toast.error('Error al cambiar estado de usuario');
    } finally {
      // setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
        <Button variant="primary" onClick={handleAddUser}>Agregar usuario</Button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N. Documento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formación</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N. Ficha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={9} className="text-center py-8">Cargando...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-8 text-gray-500">No hay usuarios registrados</td></tr>
            ) : Array.isArray(users) ? users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.document_number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.full_name || user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${roleColors[user.role] || 'bg-gray-100 text-gray-800'}`}>{user.role}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.training}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.ficha_number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {user.active ? (
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">Activo</span>
                  ) : (
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-200 text-gray-600">Inactivo</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Button variant="info" onClick={() => handleEditUser(user)} className="me-2">
                    Editar
                  </Button>
                  <Button variant="warning" onClick={() => handleOpenPasswordModal(user.id)} className="me-2"> {/* Corrected to user.id */}
                    Restablecer Contraseña
                  </Button>
                  <Button
                    variant={user.active ? 'danger' : 'success'} // Using variant for styling consistency
                    onClick={() => handleToggleActive(user)}
                  >
                    {user.active ? 'Desactivar' : 'Activar'}
                  </Button> {/* Corrected closing tag and added variant for consistency */}
                </td>
              </tr>
            )) : null}
          </tbody>
        </table>
      </div>
      <UserModal
        open={isModalOpen} // Corrected prop name
        onClose={handleModalClose}
        onSubmit={handleSaveUser} // Changed to handleSaveUser
        initialData={editingUser}
        isEdit={!!editingUser}
        // loading={loading} // Pass loading state if UserModal needs it, or UserModal handles its own
        formInstance={form} // Pass the form instance to UserModal
      />
      {/* Password Reset Modal using Ant Design Modal */}
      <AntdModal
        title="Restablecer Contraseña"
        open={isPasswordModalOpen} // Changed from 'show' to 'open' for AntdModal
        onCancel={handleCancelPasswordModal} // Changed from 'onHide' to 'onCancel'
        footer={null} // Remove default footer if using custom buttons in Form
        destroyOnClose // Optional: to reset form state when modal is closed
      >
        <Form form={passwordForm} layout="vertical" onFinish={handleResetPassword} style={{ paddingTop: '20px' }}>
          <Form.Item
            name="password"
            label="Nueva Contraseña"
            rules={[
              { required: true, message: 'Por favor ingrese la nueva contraseña' },
              { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <AntButton htmlType="button" onClick={handleCancelPasswordModal} style={{ marginRight: 8 }}>
              Cancelar
            </AntButton>
            <AntButton type="primary" htmlType="submit">
              Restablecer
            </AntButton>
          </Form.Item>
        </Form>
      </AntdModal>
    </div>
  );
};

export default UsersAdminPage;