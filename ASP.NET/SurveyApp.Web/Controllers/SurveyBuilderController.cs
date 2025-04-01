
using Microsoft.AspNetCore.Mvc;
using SurveyApp.Application.Interfaces;
using SurveyApp.Domain.Models;
using SurveyApp.Web.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SurveyApp.Web.Controllers
{
    public class SurveyBuilderController : Controller
    {
        private readonly ISurveyService _surveyService;

        public SurveyBuilderController(ISurveyService surveyService)
        {
            _surveyService = surveyService;
        }

        [HttpGet]
        public IActionResult Create()
        {
            var model = new CreateSurveyViewModel
            {
                Questions = new List<QuestionViewModel>
                {
                    new QuestionViewModel
                    {
                        Id = Guid.NewGuid().ToString(),
                        Text = "New Question",
                        Type = "text",
                        Required = true
                    }
                },
                DeliveryConfig = new DeliveryConfigViewModel
                {
                    Type = "manual",
                    EmailAddresses = new List<string>()
                }
            };
            
            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateSurveyViewModel model)
        {
            if (!ModelState.IsValid)
            {
                TempData["ErrorMessage"] = "Por favor, corrija los errores en el formulario.";
                return View(model);
            }

            try
            {
                // Mapear de ViewModel a entidad de dominio
                var survey = new SurveyApp.Domain.Models.Survey
                {
                    Id = model.Id,
                    Title = model.Title,
                    Description = model.Description,
                    Status = model.Status,
                    CreatedAt = DateTime.Now,
                    Questions = model.Questions.Select(q => new SurveyApp.Domain.Models.Question
                    {
                        Id = string.IsNullOrEmpty(q.Id) || q.Id.StartsWith("new-") 
                            ? 0 
                            : int.Parse(q.Id),
                        Text = q.Text,
                        Type = q.Type,
                        Required = q.Required,
                        Description = q.Description ?? string.Empty,
                        Options = q.Options ?? new List<string>(),
                        Settings = q.Settings != null ? new SurveyApp.Domain.Models.QuestionSettings
                        {
                            Min = q.Settings.Min,
                            Max = q.Settings.Max
                        } : null
                    }).ToList(),
                    DeliveryConfig = new SurveyApp.Domain.Models.DeliveryConfiguration
                    {
                        Type = model.DeliveryConfig?.Type ?? "manual",
                        EmailAddresses = model.DeliveryConfig?.EmailAddresses ?? new List<string>(),
                        Schedule = model.DeliveryConfig?.Schedule != null ? new SurveyApp.Domain.Models.ScheduleSettings
                        {
                            Frequency = model.DeliveryConfig.Schedule.Frequency,
                            DayOfMonth = model.DeliveryConfig.Schedule.DayOfMonth,
                            Time = model.DeliveryConfig.Schedule.Time
                        } : null,
                        Trigger = model.DeliveryConfig?.Trigger != null ? new SurveyApp.Domain.Models.TriggerSettings
                        {
                            Type = model.DeliveryConfig.Trigger.Type,
                            DelayHours = model.DeliveryConfig.Trigger.DelayHours,
                            SendAutomatically = model.DeliveryConfig.Trigger.SendAutomatically
                        } : null
                    }
                };

                bool success;
                if (model.Id > 0)
                {
                    success = await _surveyService.UpdateSurveyAsync(survey);
                    if (success)
                    {
                        TempData["SuccessMessage"] = "Encuesta actualizada exitosamente.";
                    }
                    else
                    {
                        TempData["ErrorMessage"] = "Error al actualizar la encuesta.";
                    }
                }
                else
                {
                    success = await _surveyService.CreateSurveyAsync(survey);
                    if (success)
                    {
                        TempData["SuccessMessage"] = "Encuesta creada exitosamente.";
                    }
                    else
                    {
                        TempData["ErrorMessage"] = "Error al crear la encuesta.";
                    }
                }

                if (success)
                {
                    return RedirectToAction("Index", "Surveys");
                }
            }
            catch (Exception ex)
            {
                ModelState.AddModelError("", $"Error: {ex.Message}");
                TempData["ErrorMessage"] = $"Error inesperado: {ex.Message}";
            }

            return View(model);
        }

        [HttpGet]
        public async Task<IActionResult> Edit(int id)
        {
            var survey = await _surveyService.GetSurveyByIdAsync(id);
            if (survey == null)
            {
                TempData["ErrorMessage"] = "No se encontró la encuesta solicitada.";
                return RedirectToAction("Index", "Surveys");
            }

            // Mapear de entidad de dominio a ViewModel
            var model = new CreateSurveyViewModel
            {
                Id = survey.Id,
                Title = survey.Title,
                Description = survey.Description,
                Status = survey.Status,
                Questions = survey.Questions.Select(q => new QuestionViewModel
                {
                    Id = q.Id.ToString(),
                    Text = q.Text,
                    Type = q.Type,
                    Required = q.Required,
                    Description = q.Description,
                    Options = q.Options,
                    Settings = q.Settings != null ? new QuestionSettingsViewModel
                    {
                        Min = q.Settings.Min,
                        Max = q.Settings.Max
                    } : null
                }).ToList(),
                DeliveryConfig = survey.DeliveryConfig != null ? new DeliveryConfigViewModel
                {
                    Type = survey.DeliveryConfig.Type,
                    EmailAddresses = survey.DeliveryConfig.EmailAddresses,
                    Schedule = survey.DeliveryConfig.Schedule != null ? new ScheduleSettingsViewModel
                    {
                        Frequency = survey.DeliveryConfig.Schedule.Frequency,
                        DayOfMonth = survey.DeliveryConfig.Schedule.DayOfMonth,
                        Time = survey.DeliveryConfig.Schedule.Time
                    } : null,
                    Trigger = survey.DeliveryConfig.Trigger != null ? new TriggerSettingsViewModel
                    {
                        Type = survey.DeliveryConfig.Trigger.Type,
                        DelayHours = survey.DeliveryConfig.Trigger.DelayHours,
                        SendAutomatically = survey.DeliveryConfig.Trigger.SendAutomatically
                    } : null
                } : new DeliveryConfigViewModel()
            };

            return View("Create", model);
        }

        [HttpPost]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _surveyService.DeleteSurveyAsync(id);
            if (result)
            {
                TempData["SuccessMessage"] = "Encuesta eliminada exitosamente.";
            }
            else
            {
                TempData["ErrorMessage"] = "Error al eliminar la encuesta.";
            }

            return RedirectToAction("Index", "Surveys");
        }

        [HttpPost]
        public async Task<IActionResult> SendEmails(int surveyId, List<string> emailAddresses)
        {
            try
            {
                var result = await _surveyService.SendSurveyEmailsAsync(surveyId, emailAddresses);
                if (result)
                {
                    TempData["SuccessMessage"] = "Correos enviados exitosamente.";
                }
                else
                {
                    TempData["ErrorMessage"] = "Error al enviar los correos.";
                }
            }
            catch (Exception ex)
            {
                TempData["ErrorMessage"] = $"Error al enviar los correos: {ex.Message}";
            }

            return RedirectToAction("Edit", new { id = surveyId });
        }
    }
}
