import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { collection, doc, addDoc, getFirestore, getDoc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

const Checkout = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { productoId, pedidoId } = useParams();
  const [productoData, setProductoData] = useState(null);
  const [productoIdTrimmed, setProductoIdTrimmed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      if (productoId) {
        const trimmedProductId = productoId.trim();
        if (trimmedProductId) {
          const db = getFirestore();
          const productsCollection = collection(db, 'productoId'); // Cambiado a 'productoId'
          const productRef = doc(productsCollection, trimmedProductId);

          try {
            const docSnap = await getDoc(productRef);
            if (docSnap.exists()) {
              setProductoData({ id: docSnap.id, ...docSnap.data() });
            } else {
              setError('Product not found');
            }
          } catch (error) {
            console.error('Error fetching data:', error);
            setError('Error fetching data');
          } finally {
            setLoading(false);
          }
        } else {
          setError('Invalid Product ID provided');
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [productoId]);

  const onSubmit = async (data) => {
    try {
      const db = getFirestore();

      const trimmedProductId = productoIdTrimmed || (productoId ? productoId.trim() : null);
      if (!trimmedProductId) {
        console.error('Invalid Product ID provided');
        return;
      }

      if (!productoData) {
        const productsCollection = collection(db, 'productoId');
        const productRef = doc(productsCollection, trimmedProductId);
        const docSnap = await getDoc(productRef);

        if (docSnap.exists()) {
          setProductoData({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError('Product not found');
          return;
        }
      }

      const ordersCollection = collection(db, 'orders'); // Cambiado a 'orders'
      const newOrderRef = await addDoc(ordersCollection, {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        productId: trimmedProductId,
        productName: productoData.name,
      });

      setOrderNumber(newOrderRef.id);
      setShowSuccessMessage(true);
    } catch (error) {
      console.error('Error creating order:', error);
      setError('Error creating order');
    }
  };

  if (pedidoId) {
    return (
      <div className="container">
        <h1 className="main-title">Muchas gracias por tu compra</h1>
        <p>Tu número de pedido es: {pedidoId}</p>
      </div>
    );
  }

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md={6}>
          <div className="bg-white p-4 mt-4">
            {showSuccessMessage ? (
              <Alert variant="success" onClose={() => setShowSuccessMessage(false)} dismissible>
                Order placed successfully! Your order number is: {orderNumber}
              </Alert>
            ) : (
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    {...register('email', { required: 'Ingrese  su email  ' })}
                  />
                  {errors.email && <span className="text-danger">{errors.email.message}</span>}
                </Form.Group>

                <Form.Group className="mb-3" controlId="formFirstName">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter first name"
                    {...register('firstName', { required: 'Ingrese  su apellido' })}
                  />
                  {errors.firstName && <span className="text-danger">{errors.firstName.message}</span>}
                </Form.Group>

                <Form.Group className="mb-3" controlId="formLastName">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter last name"
                    {...register('lastName', { required: 'Ingrese  su Nombre' })}
                  />
                  {errors.lastName && <span className="text-danger">{errors.lastName.message}</span>}
                </Form.Group>

                <Button variant="primary" type="submit">
                  Comprar
                </Button>
              </Form>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;
