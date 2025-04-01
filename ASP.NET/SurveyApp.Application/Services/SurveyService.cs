
using SurveyApp.Application.Interfaces;
using SurveyApp.Domain.Models;
using SurveyApp.Domain.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SurveyApp.Application.Services
{
    public class SurveyService : ISurveyService
    {
        private readonly ISurveyRepository _surveyRepository;

        public SurveyService(ISurveyRepository surveyRepository)
        {
            _surveyRepository = surveyRepository;
        }

        public async Task<IEnumerable<Survey>> GetAllSurveysAsync()
        {
            return await _surveyRepository.GetAllAsync();
        }

        public async Task<Survey?> GetSurveyByIdAsync(int id)
        {
            return await _surveyRepository.GetByIdAsync(id);
        }

        public async Task<bool> CreateSurveyAsync(Survey survey)
        {
            return await _surveyRepository.AddAsync(survey);
        }

        public async Task<bool> UpdateSurveyAsync(Survey survey)
        {
            return await _surveyRepository.UpdateAsync(survey);
        }

        public async Task<bool> DeleteSurveyAsync(int id)
        {
            return await _surveyRepository.DeleteAsync(id);
        }

        public async Task<IEnumerable<Survey>> GetSurveysByStatusAsync(string status)
        {
            return await _surveyRepository.GetByStatusAsync(status);
        }

        public async Task<bool> SendSurveyEmailsAsync(int surveyId, List<string> emailAddresses)
        {
            return await _surveyRepository.SendEmailsAsync(surveyId, emailAddresses);
        }

        public async Task<SurveyStatistics> GetSurveyStatisticsAsync(int surveyId)
        {
            return await _surveyRepository.GetStatisticsAsync(surveyId);
        }
    }
}
