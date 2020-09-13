/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  // get checkout session from the api
  try {
    const stripe = Stripe(
      'pk_test_51HQfpjCplCtklBrbegW9yT2VOa857dpoqK994oIppOYT7HrMTrJINDkKqWgShEHARnkF09VdwCJJCQD03z3Ph2cP00YuCr2qjI'
    );
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);

    //create checkout from credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    console.log(error);
    showAlert('error', error);
  }
};
