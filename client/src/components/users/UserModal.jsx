import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Checkbox, Button as AntButton } from 'antd';

const { Option } = Select;

const roles = [
  { value: 'Administrador', label: 'Administrador' },
  { value: 'Bibliotecario', label: 'Bibliotecario' },
  { value: 'Usuario', label: 'Usuario' },
];

const UserModal = ({ open, onClose, onSubmit, initialData = {}, isEdit = false, formInstance }) => {
  useEffect(() => {
    if (open) {
      if (isEdit && initialData) {
        formInstance.setFieldsValue({
          ...initialData,
          password: '', // Clear password for edit mode, or handle as needed
        });
      } else {
        formInstance.resetFields();
        formInstance.setFieldsValue({ // Default values for new user
          role: 'Usuario',
          active: true,
        });
      }
    }
  }, [open, initialData, isEdit, formInstance]);

  const handleFormSubmit = (values) => {
    const dataToSend = { ...values };
    if (isEdit && !values.password) { // If editing and password is empty, don't send it
      delete dataToSend.password;
    }
    onSubmit(dataToSend); // This calls handleSaveUser in UsersAdminPage
  };

  return (
    <Modal
      title={isEdit ? 'Editar Usuario' : 'Agregar Usuario'}
      visible={open} // Changed from 'open' to 'visible' for Ant Design Modal
      onCancel={onClose}
      footer={null} // We'll use Form's submit button
      destroyOnClose // Reset form fields when modal is closed
    >
      <Form
        form={formInstance}
        layout="vertical"
        onFinish={handleFormSubmit} // Changed from onSubmit to onFinish for Ant Design Form
        initialValues={{
          role: 'Usuario', // Default role for new user
          active: true,    // Default active state for new user
          ...(isEdit && initialData ? { ...initialData, password: '' } : {}),
        }}
      >
        <Form.Item
          name="document_number"
          label="Número de Documento"
          rules={[{ required: true, message: 'Por favor ingrese el número de documento' }]}
        >
          <Input placeholder="Ingrese el número de documento" />
        </Form.Item>
        <Form.Item
          name="full_name"
          label="Nombre Completo"
          rules={[{ required: true, message: 'Por favor ingrese el nombre completo' }]}
        >
          <Input placeholder="Ingrese el nombre completo" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, message: 'Por favor ingrese el email' }, { type: 'email', message: 'Email no válido' }]}
        >
          <Input type="email" />
        </Form.Item>
        <Form.Item name="phone" label="Teléfono">
          <Input placeholder="Ingrese el número de teléfono" />
        </Form.Item>
        {!isEdit && (
          <Form.Item
            name="password"
            label="Contraseña"
            rules={[{ required: true, message: 'Por favor ingrese la contraseña' }, {min: 6, message: 'La contraseña debe tener al menos 6 caracteres'}]}
          >
            <Input.Password />
          </Form.Item>
        )}
        {isEdit && (
          <Form.Item
            name="password"
            label="Nueva Contraseña (dejar en blanco para no cambiar)"
            rules={[{min: 6, message: 'La contraseña debe tener al menos 6 caracteres'}]}
          >
            <Input.Password placeholder="Dejar en blanco para no cambiar" />
          </Form.Item>
        )}
        <Form.Item
          name="role"
          label="Rol"
          rules={[{ required: true, message: 'Por favor seleccione un rol' }]}
        >
          <Select placeholder="Seleccione un rol">
            {roles.map(opt => (
              <Option key={opt.value} value={opt.value}>{opt.label}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="training" label="Formación">
          <Input placeholder="Ingrese la formación" />
        </Form.Item>
        <Form.Item name="ficha_number" label="Número de Ficha">
          <Input placeholder="Ingrese el número de ficha" />
        </Form.Item>
        <Form.Item name="active" valuePropName="checked">
          <Checkbox>Activo</Checkbox>
        </Form.Item>
        <Form.Item>
          <AntButton type="default" onClick={onClose} style={{ marginRight: 8 }}>
            Cancelar
          </AntButton>
          <AntButton type="primary" htmlType="submit">
            {isEdit ? 'Guardar Cambios' : 'Agregar Usuario'}
          </AntButton>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserModal;