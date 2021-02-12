import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { Container,
        Header,
        HeaderTitle,
        BackButtom,
        UserAvatar  } from './styles';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../hooks/auth';


interface RouteParams {
  providerId: string;
}

const CreateAppointment: React.FC = () => {
  const { user } = useAuth();
  const route = useRoute();
  const {providerId} = route.params as RouteParams;

  const {goBack} = useNavigation();

  const mavigateBack = useCallback(() => {
    goBack();
  },[goBack])

  return (
    <Container>
      <Header>
        <BackButtom onPress={mavigateBack}>
          <Icon name="chevron-left" size={24} color="#999591"/>
        </BackButtom>

        <HeaderTitle>Cabeleireiros</HeaderTitle>

        <UserAvatar source={{uri: user.avatar_url}}/>
      </Header>
    </Container>
  );
};

export default CreateAppointment;
