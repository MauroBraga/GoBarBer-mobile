import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { format } from 'date-fns';
import { Container,
        Header,
        HeaderTitle,
        BackButtom,
        UserAvatar,
        ProvidersListContainer,
        ProvidersList,
        ProviderContainer,
        ProviderAvatar,
        ProviderName,
        Calendar,
        Title,
        OpenDatePickerButton,
        OpenDatePickerButtonText,
        Schedule,
        Section,
        SectionTitle,
        SectionContent,
        Hour,
        HourText,
        CreateAppointmentButton,
        CreateAppointmentButtonText,
      } from './styles';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../../hooks/auth';

import DateTimePicker from '@react-native-community/datetimepicker';

import api from '../../services/api';

export interface Provider {
  id: string;
  name: string;
  avatar_url: string;
}

interface RouteParams {
  providerId: string;
}

interface AvailabilityItem {
  hour: number;
  available: boolean;
}

const CreateAppointment: React.FC = () => {
  const { user } = useAuth();
  const route = useRoute();
  const navigation = useNavigation();
  const routeParams = route.params as RouteParams;
  const {goBack} = useNavigation();

  const [availability, setAvailability] = useState<AvailabilityItem[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState(0);
  const [providers, setProviders] = useState<Provider[]>([]);


  const [selectedProvider, setSelectedProvider] = useState<string>(
    routeParams.providerId,
  );

  useEffect(() =>{
    api.get('providers').then(response =>{
      setProviders(response.data);
    });
  }, []);

  useEffect(()=>{
    api.get(`providers/${selectedProvider}/day-availability`,{
      params: {
        year: selectedDate.getFullYear(),
        month: selectedDate.getMonth() +1,
        day: selectedDate.getDate(),
      }
    }).then(response => {
        setAvailability(response.data);
    })
  },[selectedDate,selectedProvider])

  const mavigateBack = useCallback(() => {
    goBack();
  },[goBack]);

  const handleSelectProvider = useCallback((providerId: string) => {
    setSelectedProvider(providerId);
  }, []);

  const handleCreateAppointment = useCallback(async () => {
    try {
      const date = new Date(selectedDate);

      date.setHours(selectedHour);
      date.setMinutes(0);

      await api.post('appointments', {
        provider_id: selectedProvider,
        date,
      });

      navigation.navigate('AppointmentCreated', { date: date.getTime() });
    } catch (err) {
      Alert.alert(
        'Erro ao criar agendamento',
        'Ocorreu um erro ao tentar criar o agendamento, tente novamente!',
      );
    }
  }, [selectedProvider, selectedDate, selectedHour, navigation]);

  const handleToggleDatePicker = useCallback(() => {
    setShowDatePicker((state) => !state);
  },[]);

  const handleDateChanged = useCallback((event: any, date: Date | undefined) => {
      if( Platform.OS  === 'android'){
        setShowDatePicker(false);
      }
      if(date){
        setSelectedDate(date);

      }
  },[]);

  const morningAvailability = useMemo(() => {
    return availability
      .filter(({ hour }) => hour < 12)
      .map(({ hour, available }) => ({
        hour,
        hourFormatted: format(new Date().setHours(hour), 'HH:00'),
        available,
      }));
  }, [availability]);

  const afternoonAvailability = useMemo(() => {
    return availability
      .filter(({ hour }) => hour >= 12)
      .map(({ hour, available }) => ({
        hour,
        hourFormatted: format(new Date().setHours(hour), 'HH:00'),
        available,
      }));
  }, [availability]);

  return (
    <Container>
      <Header>
        <BackButtom onPress={mavigateBack}>
          <Icon name="chevron-left" size={24} color="#999591"/>
        </BackButtom>

        <HeaderTitle>Cabeleireiros</HeaderTitle>

        <UserAvatar source={{uri: user.avatar_url}}/>
      </Header>

      <ProvidersListContainer>

        <ProvidersList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={providers}
          keyExtractor={provider => provider.id}
          renderItem={({item: provider}) =>(
              <ProviderContainer
                  onPress={() => handleSelectProvider(provider.id)}
                  selected={provider.id === selectedProvider}>
                <ProviderAvatar source={{uri: provider.avatar_url}} />
                <ProviderName selected={provider.id === selectedProvider}>{provider.name}</ProviderName>

              </ProviderContainer>
            )}
        />
      </ProvidersListContainer>

      <Calendar>
        <Title>Escolha a data</Title>

        <OpenDatePickerButton onPress={handleToggleDatePicker}>
          <OpenDatePickerButtonText>Selecionar outra data</OpenDatePickerButtonText>
        </OpenDatePickerButton>

        { showDatePicker &&(
          <DateTimePicker
            mode="date"
            display="calendar"
            value={selectedDate}
            onChange={handleDateChanged}

          />

        )}

      </Calendar>

      <Schedule>
          <Title>Escolha o horário</Title>

          <Section>
            <SectionTitle>Manhã</SectionTitle>

            <SectionContent>
              {morningAvailability.map(({ hourFormatted, hour, available }) => (
                <Hour
                  available={available}
                  selected={hour === selectedHour}
                  onPress={() => setSelectedHour(hour)}
                  key={hourFormatted}
                >
                  <HourText selected={hour === selectedHour}>
                    {hourFormatted}
                  </HourText>
                </Hour>
              ))}
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>Tarde</SectionTitle>

            <SectionContent>
              {afternoonAvailability.map(
                ({ hourFormatted, hour, available }) => (
                  <Hour
                    available={available}
                    selected={hour === selectedHour}
                    onPress={() => setSelectedHour(hour)}
                    key={hourFormatted}
                  >
                    <HourText selected={hour === selectedHour}>
                      {hourFormatted}
                    </HourText>
                  </Hour>
                ),
              )}
            </SectionContent>
          </Section>
        </Schedule>

        <CreateAppointmentButton onPress={handleCreateAppointment}>
          <CreateAppointmentButtonText>Agendar</CreateAppointmentButtonText>
        </CreateAppointmentButton>


    </Container>
  );
};

export default CreateAppointment;
